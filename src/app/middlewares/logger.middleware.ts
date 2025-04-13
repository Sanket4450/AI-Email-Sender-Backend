import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    console.log(`
      --------------------------------------------
      ${req.method} - ${req.originalUrl}
      Query: ${JSON.stringify(req.query)}
      Body: ${JSON.stringify(req.body)}
      --------------------------------------------`);

    next();
  }
}
