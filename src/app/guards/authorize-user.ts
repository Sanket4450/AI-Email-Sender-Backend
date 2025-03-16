//------------------------------------------------  [ Authorize User Guard ] ------------------------------------------------
import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AppRequest } from '../types/extended.type';
import { CustomHttpException } from '../exceptions/error.exception';
import { TokenService } from '../modules/token/token.service';

@Injectable()
export class AuthorizeUserGuard implements CanActivate {
  private accessTokenSecret: string;

  constructor(private readonly tokenService: TokenService) {
    this.accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: AppRequest = context.switchToHttp().getRequest();

      const token =
        req.cookies.token || req.headers.authorization?.split(' ')[1] || '';

      const { sub } = await this.tokenService.validateAuthToken(
        token,
        this.accessTokenSecret,
      );

      req.user_id = sub;

      return true;
    } catch (err) {
      throw new CustomHttpException(
        err.status || HttpStatus.INTERNAL_SERVER_ERROR,
        err.message,
      );
    }
  }
}
