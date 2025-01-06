import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserRoleGuard } from './user-role.guard';

describe('UserRoleGuard', () => {
  let guard: UserRoleGuard;
  let reflectorMock: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflectorMock = {
      get: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new UserRoleGuard(reflectorMock);
  });

  describe('canActivate', () => {
    it('should allow access if no roles are defined', () => {
      reflectorMock.get.mockReturnValue(undefined);

      const mockContext = {
        getHandler: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'user' } }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access if roles array is empty', () => {
      reflectorMock.get.mockReturnValue([]);

      const mockContext = {
        getHandler: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'user' } }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should throw BadRequestException if user is not found', () => {
      reflectorMock.get.mockReturnValue(['admin']);

      const mockContext = {
        getHandler: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if user does not have a valid role', () => {
      reflectorMock.get.mockReturnValue(['admin']);

      const mockContext = {
        getHandler: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'user' } }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    });

    it('should allow access if user has a valid role', () => {
      reflectorMock.get.mockReturnValue(['admin']);

      const mockContext = {
        getHandler: jest.fn(),
        getType: jest.fn().mockReturnValue('http'),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ user: { role: 'admin' } }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should handle GraphQL context', () => {
      reflectorMock.get.mockReturnValue(['admin']);

      const mockContext = {
        getHandler: jest.fn(),
        getType: jest.fn().mockReturnValue('graphql'),
      } as unknown as ExecutionContext;

      const gqlContext = {
        getContext: jest.fn().mockReturnValue({
          req: { user: { role: 'admin' } },
        }),
      } as unknown as GqlExecutionContext;

      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(gqlContext);

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
