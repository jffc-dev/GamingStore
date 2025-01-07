import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { GetUserByIdUseCase } from 'src/application/use-cases/user/get-user.use-case';
import { EnvService } from 'src/infraestructure/env/env.service';
import { UnauthorizedException } from '@nestjs/common';
import { User } from 'src/domain/user';
import { JWTPayload } from 'src/infraestructure/common/interfaces/jwt-payload.interface';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let getUserByIdUseCase: jest.Mocked<GetUserByIdUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: GetUserByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    getUserByIdUseCase = module.get(GetUserByIdUseCase);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return a user if validation is successful', async () => {
      const mockPayload: JWTPayload = {
        id: 'user-123',
        email: 'john.doe@example.com',
      };
      const mockUser: User = new User({
        id: '123',
        name: 'John Doe',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'hashedPassword',
      });
      getUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await jwtStrategy.validate(mockPayload);

      expect(getUserByIdUseCase.execute).toHaveBeenCalledWith({
        id: mockPayload.id,
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const mockPayload: JWTPayload = {
        id: 'user-123',
        email: 'john.doe@example.com',
      };
      getUserByIdUseCase.execute.mockResolvedValue(null);

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
