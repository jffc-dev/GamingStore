import {
  ExecutionContext,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokenRepository } from '../../../application/contracts/persistence/token.repository';

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let tokenRepositoryMock: jest.Mocked<TokenRepository>;

  beforeEach(() => {
    tokenRepositoryMock = {
      existToken: jest.fn(),
    } as unknown as jest.Mocked<TokenRepository>;

    jwtAuthGuard = new JwtAuthGuard(tokenRepositoryMock);
  });

  describe('getRequest', () => {
    it('should return HTTP request if context type is http', () => {
      const mockHttpContext = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as unknown as ExecutionContext;

      const request = jwtAuthGuard.getRequest(mockHttpContext);
      expect(request).toEqual({ headers: {} });
    });

    it('should return GraphQL request if context type is graphql', () => {
      const mockGraphqlContext = {
        getType: () => 'graphql',
      } as unknown as ExecutionContext;

      const gqlContext = {
        getContext: () => ({ req: { headers: {} } }),
      };

      jest
        .spyOn(GqlExecutionContext, 'create')
        .mockReturnValue(gqlContext as GqlExecutionContext);

      const request = jwtAuthGuard.getRequest(mockGraphqlContext);
      expect(request).toEqual({ headers: {} });
    });

    it('should throw an error for unsupported context types', () => {
      const mockUnsupportedContext = {
        getType: () => 'unsupported',
      } as unknown as ExecutionContext;

      expect(() => jwtAuthGuard.getRequest(mockUnsupportedContext)).toThrow(
        UnsupportedMediaTypeException,
      );
    });
  });

  describe('canActivate', () => {
    it('should throw UnauthorizedException if no authorization header is present', async () => {
      const mockHttpContext = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => ({ headers: {} }),
        }),
      } as unknown as ExecutionContext;

      await expect(jwtAuthGuard.canActivate(mockHttpContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const mockHttpContext = {
        getType: () => 'http',
        switchToHttp: () => ({
          getRequest: () => ({
            headers: { authorization: 'Bearer invalid-token' },
          }),
        }),
      } as unknown as ExecutionContext;

      tokenRepositoryMock.existToken.mockResolvedValue(true);

      await expect(jwtAuthGuard.canActivate(mockHttpContext)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(tokenRepositoryMock.existToken).toHaveBeenCalledWith(
        'invalid-token',
      );
    });
  });
});
