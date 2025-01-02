import { Test } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { User } from 'src/domain/user';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let bcryptService: jest.Mocked<BcryptService>;
  let uuidService: jest.Mocked<UuidService>;

  const mockUserData = {
    name: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    address: '123 Main St',
    phoneNumber: '1234567890',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: UserRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            hash: jest.fn(),
          },
        },
        {
          provide: UuidService,
          useValue: {
            generateUuid: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<RegisterUserUseCase>(RegisterUserUseCase);
    userRepository = moduleRef.get(UserRepository);
    jwtService = moduleRef.get(JwtService);
    bcryptService = moduleRef.get(BcryptService);
    uuidService = moduleRef.get(UuidService);
  });

  it('should register user successfully', async () => {
    const userId = 'user-123';
    const hashedPassword = 'hashed-password';
    const token = 'jwt-token';

    uuidService.generateUuid.mockReturnValue(userId);
    bcryptService.hash.mockResolvedValue(hashedPassword);
    userRepository.create.mockResolvedValue({
      ...mockUserData,
      id: userId,
      password: hashedPassword,
    } as User);
    jwtService.sign.mockReturnValue(token);

    const result = await useCase.execute(mockUserData);

    expect(bcryptService.hash).toHaveBeenCalledWith(mockUserData.password);
    expect(uuidService.generateUuid).toHaveBeenCalled();
    expect(userRepository.create).toHaveBeenCalledWith({
      id: userId,
      ...mockUserData,
      password: hashedPassword,
    });
    expect(jwtService.sign).toHaveBeenCalledWith({
      id: userId,
      email: mockUserData.email,
    });
    expect(result).toEqual({ token });
  });

  it('should throw error when password hashing fails', async () => {
    bcryptService.hash.mockRejectedValue(new Error('Hashing failed'));

    await expect(useCase.execute(mockUserData)).rejects.toThrow(
      'Hashing failed',
    );
    expect(userRepository.create).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw error when user creation fails', async () => {
    const userId = 'user-123';
    const hashedPassword = 'hashed-password';

    uuidService.generateUuid.mockReturnValue(userId);
    bcryptService.hash.mockResolvedValue(hashedPassword);
    userRepository.create.mockRejectedValue(new Error('User creation failed'));

    await expect(useCase.execute(mockUserData)).rejects.toThrow(
      'User creation failed',
    );
    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
