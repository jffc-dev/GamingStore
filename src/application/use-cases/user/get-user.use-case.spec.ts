import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { NotFoundException } from '@nestjs/common';
import { User } from 'src/domain/user';
import { GetUserByIdUseCase } from './get-user.use-case';

describe('GetUserByIdUseCase', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;

  const mockUserRepository = {
    findOneById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    getUserByIdUseCase = module.get<GetUserByIdUseCase>(GetUserByIdUseCase);
  });

  it('should be defined', () => {
    expect(getUserByIdUseCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a user when found', async () => {
      const userId = '123';
      const mockUser: User = new User({
        id: '123',
        name: 'John Doe',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
      });

      mockUserRepository.findOneById.mockResolvedValue(mockUser);

      const result = await getUserByIdUseCase.execute({ id: userId });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOneById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const userId = '123';

      mockUserRepository.findOneById.mockResolvedValue(null);

      await expect(getUserByIdUseCase.execute({ id: userId })).rejects.toThrow(
        NotFoundException,
      );
      await expect(getUserByIdUseCase.execute({ id: userId })).rejects.toThrow(
        'User not found',
      );
    });
  });
});
