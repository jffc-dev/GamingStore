import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '../prisma.service';
import { PrismaUserMapper } from '../mappers/prisma-user.mapper';
import { User } from 'src/domain/user';
import {
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPrismaMapper = {
    toPrisma: jest.fn(),
    toDomain: jest.fn(),
  };

  const mockUser: User = new User({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    lastName: 'Test User',
    password: 'hashed-password',
    resetPasswordToken: 'reset-token',
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaUserMapper, useValue: mockPrismaMapper },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      const prismaUser = { email: 'test@example.com' };
      mockPrismaMapper.toPrisma.mockReturnValue(prismaUser);
      mockPrismaService.user.create.mockResolvedValue(prismaUser);
      mockPrismaMapper.toDomain.mockReturnValue(mockUser);

      const result = await repository.create(mockUser);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: prismaUser,
      });
      expect(result).toEqual(mockUser);
    });

    it('should handle P2002 error', async () => {
      const error = { code: 'P2002', meta: { target: ['email'] } };
      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(repository.create(mockUser)).rejects.toThrow(
        NotAcceptableException,
      );
    });

    it('should handle other database errors', async () => {
      const error = new Error('Database error');
      mockPrismaService.user.create.mockRejectedValue(error);

      await expect(repository.create(mockUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should find a user by email and return it', async () => {
      const prismaUser = { email: 'test@example.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);
      mockPrismaMapper.toDomain.mockReturnValue(mockUser);

      const result = await repository.findUserByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserByEmail('test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findUserByResetToken', () => {
    it('should find a user by reset token and return it', async () => {
      const prismaUser = { resetPasswordToken: 'reset-token' };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);
      mockPrismaMapper.toDomain.mockReturnValue(mockUser);

      const result = await repository.findUserByResetToken('reset-token');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { resetPasswordToken: 'reset-token' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserByResetToken('reset-token');

      expect(result).toBeNull();
    });
  });

  describe('updateUserById', () => {
    it('should update a user and return it', async () => {
      const prismaUser = { userId: 'user-123' };
      mockPrismaMapper.toPrisma.mockReturnValue(prismaUser);
      mockPrismaService.user.update.mockResolvedValue(prismaUser);
      mockPrismaMapper.toDomain.mockReturnValue(mockUser);

      const result = await repository.updateUserById('user-123', mockUser);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: prismaUser,
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOneById', () => {
    it('should find a user by ID and return it', async () => {
      const prismaUser = { userId: 'user-123' };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);
      mockPrismaMapper.toDomain.mockReturnValue(mockUser);

      const result = await repository.findOneById('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.findOneById('user-123');

      expect(result).toBeNull();
    });
  });
});
