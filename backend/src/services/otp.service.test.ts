import { describe, expect, it } from 'vitest';

import { generateSecureOtp, hashOtp, verifyOtpHash } from './otp.service';

describe('otp.service', () => {
  it('creates and verifies valid OTP hashes', async () => {
    const code = '123456';
    const hash = await hashOtp(code);

    await expect(verifyOtpHash(code, hash)).resolves.toBe(true);
    await expect(verifyOtpHash('654321', hash)).resolves.toBe(false);
  });

  it('generates six-digit OTPs', () => {
    expect(generateSecureOtp()).toMatch(/^\d{6}$/);
  });
});
