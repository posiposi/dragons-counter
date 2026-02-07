import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/exceptions/domain-exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly STATUS_CODE_MAP: Record<string, HttpStatus> = {
    NOT_FOUND: HttpStatus.NOT_FOUND,
    USER_NOT_FOUND: HttpStatus.NOT_FOUND,
    ALREADY_EXISTS: HttpStatus.CONFLICT,
    USER_ALREADY_EXISTS: HttpStatus.CONFLICT,
    EMAIL_ALREADY_EXISTS: HttpStatus.CONFLICT,
    UNAUTHORIZED: HttpStatus.UNAUTHORIZED,
    FORBIDDEN: HttpStatus.FORBIDDEN,
  };

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const statusCode = this.resolveStatusCode(exception.code);

    response.status(statusCode).json({
      statusCode,
      error: exception.code,
      message: exception.message,
    });
  }

  private resolveStatusCode(code: string): HttpStatus {
    if (this.STATUS_CODE_MAP[code]) {
      return this.STATUS_CODE_MAP[code];
    }

    for (const [key, status] of Object.entries(this.STATUS_CODE_MAP)) {
      if (code.endsWith(key)) {
        return status;
      }
    }

    return HttpStatus.BAD_REQUEST;
  }
}
