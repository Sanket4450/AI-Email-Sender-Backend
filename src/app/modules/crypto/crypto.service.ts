import { Injectable, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { CustomHttpException } from 'src/app/exceptions/error.exception';
import { ERROR_MSG } from 'src/app/utils/messages';

@Injectable()
export class CryptoService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly key = crypto.scryptSync(
    process.env.ENCRYPTION_KEY,
    'salt',
    32,
  );

  /**
   * Encrypts a string using a symmetric key.
   * @param text The plaintext string to encrypt.
   * @returns The encrypted string in hexadecimal format, prefixed with IV.
   */
  encrypt(text: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      const ivHex = iv.toString('hex');
      return `${ivHex}:${encrypted}`; // Store IV with encrypted data
    } catch (error) {
      throw new CustomHttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ERROR_MSG.ENCRYPTION_FAILED,
      );
    }
  }

  /**
   * Decrypts an encrypted string using the same symmetric key.
   * @param encryptedText The encrypted string in hexadecimal format, prefixed with IV.
   * @returns The decrypted plaintext string.
   */
  decrypt(encryptedText: string): string {
    try {
      const [ivHex, encrypted] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      throw new CustomHttpException(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ERROR_MSG.DECRYPTION_FAILED,
      );
    }
  }
}
