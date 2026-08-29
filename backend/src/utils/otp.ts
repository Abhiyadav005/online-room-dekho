import { randomInt } from 'crypto';

export const generateOtp = (): string => randomInt(100_000, 1_000_000).toString();
