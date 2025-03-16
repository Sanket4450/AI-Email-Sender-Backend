import { HttpException } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(statusCode: number, message: string, stackTrace?: any) {
    super(
      {
        success: false,
        statusCode,
        message,
        ...(stackTrace && { stackTrace }),
      },
      statusCode,
    );
  }
}
