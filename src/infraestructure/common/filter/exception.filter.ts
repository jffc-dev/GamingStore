import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { GraphQLError } from 'graphql';

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private response: Response;
  private contextType: string;

  private handleError(code: HttpStatus, message: string) {
    if (this.contextType === 'graphql') {
      throw new GraphQLError(message, {
        extensions: {
          code,
        },
      });
    } else if (this.contextType === 'http') {
      this.response.status(Number(code)).json({ message });
    }
    return;
  }

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { code, meta } = exception;

    this.contextType = host.getType();
    if (host.getType() === 'http') {
      this.response = response;
    }

    switch (code) {
      case 'P2002': {
        const message = `Unique constraint failed on the field: ${(meta.target as any).join(', ')}`;
        this.handleError(HttpStatus.FORBIDDEN, message);
        break;
      }
      case 'P2025': {
        const message = `Error ${meta.action} ${meta.modelName}, not found`;
        this.handleError(HttpStatus.NOT_FOUND, message);
        break;
      }
      case 'P2003': {
        const message = `Error ${meta.action} ${meta.modelName}, something went wrong with ${meta.field_name}`;
        this.handleError(HttpStatus.UNPROCESSABLE_ENTITY, message);
      }
      case 'CUSTOM-001': {
        this.handleError(
          HttpStatus.UNPROCESSABLE_ENTITY,
          meta.custom_message + '',
        );
      }
      default:
        super.catch(exception, host);
        break;
    }
  }
}
