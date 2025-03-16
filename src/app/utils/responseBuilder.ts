import { HttpStatus } from '@nestjs/common';
import { SUCCESS_MSG } from './messages';

interface ResponseBuilder {
  statusCode?: number;
  message?: string;
  result?: object | Array<object>;
}

export const responseBuilder = ({
  statusCode = HttpStatus.OK,
  message = SUCCESS_MSG.OK,
  result = {},
}: ResponseBuilder) => {
  return {
    success: true,
    statusCode,
    message,
    result,
  };
};
