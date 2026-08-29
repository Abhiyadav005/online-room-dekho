import rateLimit from 'express-rate-limit';

const message = { success: false, message: 'Too many requests. Please try again later.', code: 'RATE_LIMITED' };

export const generalRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-8', legacyHeaders: false, message });
export const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message });
export const otpRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false, message });
export const aiRateLimit = rateLimit({ windowMs: 10 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false, message });
