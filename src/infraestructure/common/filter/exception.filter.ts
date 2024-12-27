import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch()
export class UnifiedExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message = exception.message || 'Internal Server Error';

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      errorCode: exception.code || 'UNEXPECTED_ERROR',
    });
  }
}
