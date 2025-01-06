import { UserRoleGuard } from './user-role.guard';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

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
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });

    it('should allow access if roles array is empty', () => {
      reflectorMock.get.mockReturnValue([]);

      const mockContext = {
        getHandler: jest.fn(),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockContext);
      expect(result).toBe(true);
    });
  });
});
