import { Test, TestingModule } from '@nestjs/testing';
import { PrismaTokenRepository } from './prisma-token.repository';
import { PrismaService } from '../prisma.service';

describe('PrismaTokenRepository', () => {
  let repository: PrismaTokenRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    revokedToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaTokenRepository,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    repository = module.get<PrismaTokenRepository>(PrismaTokenRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a revoked token and return true', async () => {
      const token = 'test-token';
      mockPrismaService.revokedToken.create.mockResolvedValue({ token });

      const result = await repository.create(token);

      expect(prismaService.revokedToken.create).toHaveBeenCalledWith({
        data: { token },
      });
      expect(result).toBe(true);
    });

    it('should throw an error if creation fails', async () => {
      const token = 'test-token';
      mockPrismaService.revokedToken.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(repository.create(token)).rejects.toThrow('Database error');
    });
  });

  describe('existToken', () => {
    it('should return true if the token exists', async () => {
      const token = 'existing-token';
      mockPrismaService.revokedToken.findUnique.mockResolvedValue({ token });

      const result = await repository.existToken(token);

      expect(prismaService.revokedToken.findUnique).toHaveBeenCalledWith({
        where: { token },
      });
      expect(result).toBe(true);
    });

    it('should return false if the token does not exist', async () => {
      const token = 'non-existing-token';
      mockPrismaService.revokedToken.findUnique.mockResolvedValue(null);

      const result = await repository.existToken(token);

      expect(prismaService.revokedToken.findUnique).toHaveBeenCalledWith({
        where: { token },
      });
      expect(result).toBe(false);
    });

    it('should throw an error if findUnique fails', async () => {
      const token = 'error-token';
      mockPrismaService.revokedToken.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(repository.existToken(token)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
