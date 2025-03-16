// jwt.service.ts
import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ERROR_MSG } from 'src/app/utils/messages';
import { CustomHttpException } from 'src/app/exceptions/error.exception';

@Injectable()
export class TokenService {
  private accessTokenSecret: string;
  private accessTokenExpiry: string;

  constructor(private readonly jwtService: JwtService) {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    this.accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY;
  }

  async signToken(
    payload: Buffer | object,
    secretKey?: string,
    expiry?: string,
  ): Promise<string> {
    try {
      const token = await this.jwtService.signAsync(payload, {
        secret: secretKey || this.accessTokenSecret,
        expiresIn: expiry || this.accessTokenExpiry,
      });

      return token;
    } catch (err) {
      throw new CustomHttpException(
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        err.message,
      );
    }
  }

  async verifyToken(token: string, secretKey?: string): Promise<any> {
    return this.jwtService.verifyAsync(token, {
      secret: secretKey || this.accessTokenSecret,
    });
  }

  async validateAuthToken(token: string, secretKey?: string): Promise<any> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: secretKey || this.accessTokenSecret,
      });

      return decoded;
    } catch (err) {
      if (err.name === ERROR_MSG.TOKEN_EXPIRED_ERROR) {
        throw new CustomHttpException(
          HttpStatus.UNAUTHORIZED,
          ERROR_MSG.TOKEN_EXPIRED,
        );
      } else {
        throw new CustomHttpException(
          HttpStatus.UNAUTHORIZED,
          ERROR_MSG.UNAUTHORIZED,
        );
      }
    }
  }
}
