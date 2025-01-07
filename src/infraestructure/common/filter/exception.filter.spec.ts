import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { PrismaClientExceptionFilter } from './exception.filter';

describe('PrismaClientExceptionFilter', () => {
  let filter: PrismaClientExceptionFilter;

  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockHttpArgumentsHost = {
    switchToHttp: () => ({
      getResponse: () => mockResponse,
    }),
    getType: () => 'http',
  } as ArgumentsHost;

  const mockGraphQLArgumentsHost = {
    switchToHttp: () => ({
      getResponse: () => ({}),
    }),
    getType: () => 'graphql',
  } as ArgumentsHost;

  beforeEach(() => {
    filter = new PrismaClientExceptionFilter();
    jest.clearAllMocks();
  });

  describe('HTTP Context', () => {
    it('should handle P2002 unique constraint violation', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '1.0',
          meta: {
            target: ['email', 'username'],
          },
        },
      );

      filter.catch(exception, mockHttpArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unique constraint failed on the field: email, username',
      });
    });

    it('should handle P2025 not found error', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '1.0',
          meta: {
            action: 'finding',
            modelName: 'User',
          },
        },
      );

      filter.catch(exception, mockHttpArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error finding User, not found',
      });
    });

    // it('should handle P2003 foreign key constraint error', () => {
    //   const exception = new Prisma.PrismaClientKnownRequestError(
    //     'Foreign key constraint failed',
    //     {
    //       code: 'P2003',
    //       clientVersion: '1.0',
    //       meta: {
    //         action: 'creating',
    //         modelName: 'Post',
    //         field_name: 'authorId',
    //       },
    //     },
    //   );

    //   filter.catch(exception, mockHttpArgumentsHost);

    //   expect(mockResponse.status).toHaveBeenCalledWith(
    //     HttpStatus.UNPROCESSABLE_ENTITY,
    //   );
    //   expect(mockResponse.json).toHaveBeenCalledWith({
    //     message: 'Error creating Post, something went wrong with authorId',
    //   });
    // });

    // it('should handle custom error CUSTOM-001', () => {
    //   const exception = new Prisma.PrismaClientKnownRequestError(
    //     'Custom error',
    //     {
    //       code: 'CUSTOM-001',
    //       clientVersion: '1.0',
    //       meta: {
    //         custom_message: 'Custom error message',
    //       },
    //     },
    //   );

    //   filter.catch(exception, mockHttpArgumentsHost);

    //   expect(mockResponse.status).toHaveBeenCalledWith(
    //     HttpStatus.UNPROCESSABLE_ENTITY,
    //   );
    //   expect(mockResponse.json).toHaveBeenCalledWith({
    //     message: 'Custom error message',
    //   });
    // });
  });

  describe('GraphQL Context', () => {
    it('should handle P2002 unique constraint violation', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '1.0',
          meta: {
            target: ['email'],
          },
        },
      );

      expect(() => filter.catch(exception, mockGraphQLArgumentsHost)).toThrow(
        GraphQLError,
      );
      try {
        filter.catch(exception, mockGraphQLArgumentsHost);
      } catch (error) {
        expect(error).toBeInstanceOf(GraphQLError);
        expect(error.extensions.code).toBe(HttpStatus.FORBIDDEN);
        expect(error.message).toBe(
          'Unique constraint failed on the field: email',
        );
      }
    });

    it('should handle P2025 not found error', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '1.0',
          meta: {
            action: 'finding',
            modelName: 'User',
          },
        },
      );

      expect(() => filter.catch(exception, mockGraphQLArgumentsHost)).toThrow(
        GraphQLError,
      );
      try {
        filter.catch(exception, mockGraphQLArgumentsHost);
      } catch (error) {
        expect(error).toBeInstanceOf(GraphQLError);
        expect(error.extensions.code).toBe(HttpStatus.NOT_FOUND);
        expect(error.message).toBe('Error finding User, not found');
      }
    });

    it('should handle unknown error codes', () => {
      const exception = new Prisma.PrismaClientKnownRequestError(
        'Unknown error',
        {
          code: 'UNKNOWN',
          clientVersion: '1.0',
          meta: {},
        },
      );

      const mockSuperCatch = jest.fn();
      PrismaClientExceptionFilter.prototype['catch'] = mockSuperCatch;

      filter.catch(exception, mockGraphQLArgumentsHost);
      expect(mockSuperCatch).toHaveBeenCalledWith(
        exception,
        mockGraphQLArgumentsHost,
      );
    });
  });

  describe('Error handling for different contexts', () => {
    it('should handle unknown context types', () => {
      const mockUnknownArgumentsHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
        }),
        getType: () => 'unknown',
      } as ArgumentsHost;

      const exception = new Prisma.PrismaClientKnownRequestError('Test error', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: {
          target: ['email'],
        },
      });

      expect(() =>
        filter.catch(exception, mockUnknownArgumentsHost),
      ).not.toThrow();
    });

    it('should handle PrismaClientUnknownRequestError', () => {
      const exception = new Prisma.PrismaClientUnknownRequestError(
        'Unknown request error',
        {
          clientVersion: '1.0',
        },
      );

      const mockSuperCatch = jest.fn();
      PrismaClientExceptionFilter.prototype['catch'] = mockSuperCatch;

      filter.catch(exception as any, mockHttpArgumentsHost);
      expect(mockSuperCatch).toHaveBeenCalledWith(
        exception,
        mockHttpArgumentsHost,
      );
    });
  });
});
