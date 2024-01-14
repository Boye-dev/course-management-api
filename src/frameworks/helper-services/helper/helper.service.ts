import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class HelperService {
  constructor() {}
  async generateVerificationToken(): Promise<string> {
    const token = randomBytes(32).toString('hex');
    return token;
  }

  generateOtpToken(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
