import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { OwnerProfile } from '../models/OwnerProfile';
import { OTP, type OtpPurpose } from '../models/OTP';
import { User } from '../models/User';
import { env, isProduction } from '../config/env';
import { AppError } from '../utils/AppError';
import { ok } from '../utils/apiResponse';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateOtp } from '../utils/otp';
import { publicUser } from '../utils/serializers';
import { recordAudit } from '../utils/audit';
import { getSmsProvider } from '../integrations/sms';

const refreshCookie = 'srf_refresh';
const refreshCookieOptions = {
  httpOnly: true,
  secure: env.cookieSecure || isProduction,
  sameSite: 'lax' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

function setRefreshCookie(res: Response, userId: string, role: 'user' | 'owner' | 'admin'): void {
  res.cookie(refreshCookie, signRefreshToken(userId, role), refreshCookieOptions);
}

async function issueOtp(phone: string, purpose: OtpPurpose): Promise<void> {
  const existing = await OTP.findOne({ phone, purpose }).select('+codeHash');
  const now = new Date();
  if (existing && existing.lastSentAt.getTime() + env.sms.resendCooldownSeconds * 1000 > now.getTime()) {
    throw new AppError('Please wait before requesting another code', 429, 'OTP_COOLDOWN');
  }

  const code = generateOtp();
  // The code is passed only to the configured SMS provider and is never logged or returned.
  await getSmsProvider().sendOtp({ phone, code, purpose });
  const codeHash = await bcrypt.hash(code, 12);
  const expiresAt = new Date(now.getTime() + env.sms.otpTtlMinutes * 60 * 1000);
  if (existing) {
    existing.codeHash = codeHash;
    existing.attempts = 0;
    existing.maxAttempts = env.sms.maxAttempts;
    existing.lastSentAt = now;
    existing.expiresAt = expiresAt;
    await existing.save();
  } else {
    await OTP.create({ phone, purpose, codeHash, attempts: 0, maxAttempts: env.sms.maxAttempts, lastSentAt: now, expiresAt });
  }
}

async function consumeOtp(phone: string, purpose: OtpPurpose, code: string): Promise<void> {
  const record = await OTP.findOne({ phone, purpose }).select('+codeHash');
  if (!record || record.expiresAt <= new Date()) {
    if (record) await record.deleteOne();
    throw new AppError('OTP is invalid or expired', 400, 'INVALID_OTP');
  }
  if (record.attempts >= record.maxAttempts) {
    await record.deleteOne();
    throw new AppError('OTP attempt limit reached. Request a new code.', 429, 'OTP_ATTEMPTS_EXCEEDED');
  }
  const matches = await bcrypt.compare(code, record.codeHash);
  if (!matches) {
    record.attempts += 1;
    await record.save();
    throw new AppError('OTP is invalid or expired', 400, 'INVALID_OTP');
  }
  await record.deleteOne();
}

export async function register(req: Request, res: Response): Promise<Response> {
  const { name, email, phone, password, role } = req.body as { name: string; email: string; phone: string; password: string; role: 'user' | 'owner' };
  const [emailExists, phoneExists] = await Promise.all([User.exists({ email: email.toLowerCase() }), User.exists({ phone })]);
  if (emailExists || phoneExists) throw new AppError('An account already uses that email or phone', 409, 'DUPLICATE_ACCOUNT');

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email: email.toLowerCase(), phone, passwordHash, role });
  if (role === 'owner') await OwnerProfile.create({ user: user._id });
  setRefreshCookie(res, user._id.toString(), user.role);
  await recordAudit(req, { actor: user._id, action: 'auth.register', entityType: 'user', entityId: user._id, metadata: { role } });
  return res.status(201).json({ success: true, data: { user: publicUser(user), token: signAccessToken(user._id.toString(), user.role) } });
}

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  if (user.isSuspended) throw new AppError('This account is suspended', 403, 'ACCOUNT_SUSPENDED');
  user.lastLoginAt = new Date();
  await user.save();
  setRefreshCookie(res, user._id.toString(), user.role);
  await recordAudit(req, { actor: user._id, action: 'auth.login', entityType: 'user', entityId: user._id });
  return ok(res, { user: publicUser(user), token: signAccessToken(user._id.toString(), user.role) });
}

export async function logout(req: Request, res: Response): Promise<Response> {
  res.clearCookie(refreshCookie, { ...refreshCookieOptions, maxAge: undefined });
  if (req.auth) await recordAudit(req, { actor: req.auth.userId, action: 'auth.logout', entityType: 'user', entityId: req.auth.userId });
  return ok(res, { loggedOut: true });
}

export async function refresh(req: Request, res: Response): Promise<Response> {
  const token = req.cookies?.[refreshCookie] as string | undefined;
  if (!token) throw new AppError('Refresh token is required', 401, 'REFRESH_REQUIRED');
  const claims = verifyRefreshToken(token);
  const user = await User.findById(claims.sub).select('role isSuspended');
  if (!user || user.isSuspended) throw new AppError('This account is unavailable', 403, 'ACCOUNT_UNAVAILABLE');
  setRefreshCookie(res, user._id.toString(), user.role);
  return ok(res, { token: signAccessToken(user._id.toString(), user.role) });
}

export async function sendOtp(req: Request, res: Response): Promise<Response> {
  const { phone, purpose } = req.body as { phone: string; purpose: OtpPurpose };
  const account = await User.exists({ phone });
  // Account presence is intentionally not revealed for password reset requests.
  if (purpose === 'password_reset' && !account) return ok(res, { sent: true });
  await issueOtp(phone, purpose);
  return ok(res, { sent: true, expiresInSeconds: env.sms.otpTtlMinutes * 60 });
}

export async function verifyOtp(req: Request, res: Response): Promise<Response> {
  const { phone, purpose, otp } = req.body as { phone: string; purpose: OtpPurpose; otp: string };
  if (purpose !== 'phone_verification') {
    throw new AppError('Use reset-password to verify a password-reset code', 400, 'INVALID_OTP_PURPOSE');
  }
  await consumeOtp(phone, purpose, otp);
  const user = await User.findOneAndUpdate({ phone }, { phoneVerified: true }, { new: true });
  if (!user) throw new AppError('No account is associated with that phone', 404, 'ACCOUNT_NOT_FOUND');
  return ok(res, { verified: true, user: publicUser(user) });
}

export async function forgotPassword(req: Request, res: Response): Promise<Response> {
  const { phone } = req.body as { phone: string };
  if (await User.exists({ phone })) await issueOtp(phone, 'password_reset');
  return ok(res, { sent: true });
}

export async function resetPassword(req: Request, res: Response): Promise<Response> {
  const { phone, otp, password } = req.body as { phone: string; otp: string; password: string };
  await consumeOtp(phone, 'password_reset', otp);
  const user = await User.findOne({ phone }).select('+passwordHash');
  if (!user) throw new AppError('No account is associated with that phone', 404, 'ACCOUNT_NOT_FOUND');
  user.passwordHash = await bcrypt.hash(password, 12);
  await user.save();
  setRefreshCookie(res, user._id.toString(), user.role);
  await recordAudit(req, { actor: user._id, action: 'auth.password_reset', entityType: 'user', entityId: user._id });
  return ok(res, { reset: true, token: signAccessToken(user._id.toString(), user.role) });
}
