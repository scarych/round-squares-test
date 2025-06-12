import { Injectable } from '@nestjs/common';
import * as crypto from 'node:crypto';

const { SALT_SECRET_KEY } = process.env;

if (!SALT_SECRET_KEY) {
  throw new Error('process.env.SALT_SECRET_KEY required');
}

@Injectable()
export class PasswordService {
  private readonly secretSalt = String(SALT_SECRET_KEY);

  randomString(length: number) {
    return crypto.randomBytes(length).toString('hex');
  }

  hashString(value: string): string {
    return crypto
      .createHmac('sha256', this.secretSalt)
      .update(value)
      .digest('hex');
  }

  comparePassword(password: string, hash: string): boolean {
    const encryptedPassword = this.hashString(password);
    return encryptedPassword === hash;
  }
}
