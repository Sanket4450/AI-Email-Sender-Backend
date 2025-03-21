import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ERROR_MSG } from '../utils/messages';
import { APP_ENV } from '../utils/constants';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof BadRequestException
        ? (exception as any).response.message[0]
        : (exception as any).message || ERROR_MSG.INTERNAL_SERVER_ERROR;

    if (process.env.NODE_ENV === APP_ENV.DEVELOPMENT) console.error(exception);

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  }
}
