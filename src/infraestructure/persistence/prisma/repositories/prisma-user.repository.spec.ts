import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaUserRepository } from './prisma-user.repository';
import { User } from 'src/domain/user';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ACTION_CREATE } from 'src/application/utils/constants';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUser = new User({
    id: 'user-1',
    name: 'test',
    lastName: 'test',
    email: 'test@example.com',
    password: 'hashedPassword123',
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
  });

  const mockPrismaUser = {
    userId: 'user-1',
    name: 'test',
    email: 'Test@example.com',
    password: 'hashedPassword123',
    resetPasswordToken: null,
    resetPasswordExpires: null,
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new User entity', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockPrismaUser);

      const result = await repository.create(mockUser);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          name: mockUser.name,
          lastName: mockUser.lastName,
          email: mockUser.email,
          password: mockUser.password,
          resetPasswordToken: mockUser.resetPasswordToken,
          resetPasswordExpiresAt: mockUser.resetPasswordExpiresAt,
          address: undefined,
          phoneNumber: undefined,
          role: undefined,
        },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(mockUser.id);
    });

    it('should handle database errors during creation', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
      });

      mockPrismaService.user.create.mockRejectedValue(mockError);

      await expect(repository.create(mockUser)).rejects.toThrow();
    });
  });

  describe('findUserByEmail', () => {
    it('should return a User entity when found by email', async () => {
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(
        mockPrismaUser,
      );

      const result = await repository.findUserByEmail('Test@example.com');

      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { email: 'Test@example.com' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.email).toBe('Test@example.com');
    });

    it('should handle database errors during email search', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(mockError);

      await expect(
        repository.findUserByEmail('nonexistent@example.com'),
      ).rejects.toThrow();
    });
  });

  describe('findUserByResetToken', () => {
    it('should return a User entity when found by reset token', async () => {
      const userWithToken = {
        ...mockPrismaUser,
        resetPasswordToken: 'valid-token',
      };
      mockPrismaService.user.findUniqueOrThrow.mockResolvedValue(userWithToken);

      const result = await repository.findUserByResetToken('valid-token');

      expect(prismaService.user.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { resetPasswordToken: 'valid-token' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.resetPasswordToken).toBe('valid-token');
    });

    it('should handle database errors during reset token search', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      mockPrismaService.user.findUniqueOrThrow.mockRejectedValue(mockError);

      await expect(
        repository.findUserByResetToken('invalid-token'),
      ).rejects.toThrow();
    });
  });

  describe('updateUserById', () => {
    it('should update and return the updated User entity', async () => {
      const updatedPrismaUser = {
        ...mockPrismaUser,
        name: 'Test Updated',
      };
      mockPrismaService.user.update.mockResolvedValue(updatedPrismaUser);

      const updatedUser = new User({
        ...mockUser,
        name: 'Test Updated',
        lastName: 'Test Updated',
        email: 'test',
        password: 'hashedPassword123',
      });

      const result = await repository.updateUserById('user-1', updatedUser);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: {
          userId: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          password: updatedUser.password,
          resetPasswordToken: updatedUser.resetPasswordToken,
          resetPasswordExpiresAt: updatedUser.resetPasswordExpiresAt,
          lastName: updatedUser.lastName,
          address: undefined,
          phoneNumber: undefined,
          role: undefined,
        },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.name).toBe('Test Updated');
    });

    it('should handle database errors during update', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      mockPrismaService.user.update.mockRejectedValue(mockError);

      await expect(
        repository.updateUserById('user-1', mockUser),
      ).rejects.toThrow();
    });
  });

  describe('findOneById', () => {
    it('should return a User entity when found by id', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockPrismaUser);

      const result = await repository.findOneById('user-1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe('user-1');
    });

    it('should return null when user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneById('nonexistent-id');

      expect(result).toBeNull();
    });

    it('should handle database errors during id search', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2025',
        clientVersion: '1.0',
      });

      mockPrismaService.user.findUnique.mockRejectedValue(mockError);

      await expect(repository.findOneById('user-1')).rejects.toThrow();
    });
  });

  describe('handleDBError', () => {
    it('should throw the error with added action metadata', () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
        meta: {},
      });

      expect(() => {
        repository.handleDBError(mockError, ACTION_CREATE);
      }).toThrow();

      expect(mockError.meta).toHaveProperty('action', ACTION_CREATE);
    });
  });
});
