import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase } from './login-user.use-case';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { BadRequestException } from '@nestjs/common';
import { User } from 'src/domain/user';

const mockUserRepository = () => ({
  findUserByEmail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

const mockBcryptService = () => ({
  compare: jest.fn(),
});

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let bcryptService: jest.Mocked<BcryptService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        { provide: UserRepository, useFactory: mockUserRepository },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: BcryptService, useFactory: mockBcryptService },
      ],
    }).compile();

    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get(UserRepository);
    jwtService = module.get(JwtService);
    bcryptService = module.get(BcryptService);
  });

  it('should be defined', () => {
    expect(loginUserUseCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(bcryptService).toBeDefined();
  });

  it('should return a token for valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';
    const userId = 'user-id';

    const user = new User({
      id: userId,
      email,
      password: hashedPassword,
      name: 'test',
      lastName: 'test',
    });

    userRepository.findUserByEmail.mockResolvedValue(user);
    bcryptService.compare.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mock-token');

    const result = await loginUserUseCase.execute({ email, password });

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
    expect(bcryptService.compare).toHaveBeenCalledWith(
      password,
      hashedPassword,
    );
    expect(jwtService.sign).toHaveBeenCalledWith({ id: userId, email });
    expect(result).toEqual({ token: 'mock-token' });
  });

  it('should throw an error for invalid credentials', async () => {
    const email = 'test@example.com';
    const password = 'wrongPassword';
    const hashedPassword = 'hashedPassword123';

    const user = new User({
      id: 'user-id',
      email,
      password: hashedPassword,
      name: 'test',
      lastName: 'test',
    });

    userRepository.findUserByEmail.mockResolvedValue(user);
    bcryptService.compare.mockResolvedValue(false);

    await expect(loginUserUseCase.execute({ email, password })).rejects.toThrow(
      BadRequestException,
    );

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
    expect(bcryptService.compare).toHaveBeenCalledWith(
      password,
      hashedPassword,
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should handle repository errors', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    const error = new Error('Repository error');

    userRepository.findUserByEmail.mockRejectedValue(error);

    await expect(loginUserUseCase.execute({ email, password })).rejects.toThrow(
      'Repository error',
    );

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
    expect(bcryptService.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
