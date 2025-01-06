import {
  ArgumentsHost,
  Catch,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    // console.error('host', host);
    // console.error(exception);
    // const ctx = host.switchToHttp();
    // const contextType = host.getType();
    // const response = ctx.getResponse();
    const { code, meta } = exception;

    switch (code) {
      case 'P2002': {
        break;
      }
      case 'P2025': {
        const message = `Error ${meta.action} ${meta.modelName}, not found`;
        throw new NotFoundException(message);
      }
      case 'P2003': {
        const message = `Error ${meta.action} ${meta.modelName}, something bad with ${meta.field_name}`;
        throw new UnprocessableEntityException(message);
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
