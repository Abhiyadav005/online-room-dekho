import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './AppError';

export interface TokenClaims extends JwtPayload {
  sub: string;
  role: 'user' | 'owner' | 'admin';
  type: 'access' | 'refresh';
}

const sign = (claims: Omit<TokenClaims, 'iat' | 'exp'>, secret: string, expiresIn: string): string =>
  jwt.sign(claims, secret, { expiresIn } as SignOptions);

export const signAccessToken = (userId: string, role: TokenClaims['role']): string =>
  sign({ sub: userId, role, type: 'access' }, env.jwtSecret, env.jwtExpiresIn);

export const signRefreshToken = (userId: string, role: TokenClaims['role']): string =>
  sign({ sub: userId, role, type: 'refresh' }, env.jwtRefreshSecret, env.jwtRefreshExpiresIn);

export function verifyAccessToken(token: string): TokenClaims {
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as TokenClaims;
    if (decoded.type !== 'access' || !decoded.sub) throw new Error('wrong token type');
    return decoded;
  } catch {
    throw new AppError('Authentication token is invalid or expired', 401, 'INVALID_TOKEN');
  }
}

export function verifyRefreshToken(token: string): TokenClaims {
  try {
    const decoded = jwt.verify(token, env.jwtRefreshSecret) as TokenClaims;
    if (decoded.type !== 'refresh' || !decoded.sub) throw new Error('wrong token type');
    return decoded;
  } catch {
    throw new AppError('Refresh token is invalid or expired', 401, 'INVALID_REFRESH_TOKEN');
  }
}
