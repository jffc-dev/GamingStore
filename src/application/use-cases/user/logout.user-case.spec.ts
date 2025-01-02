import { Test, TestingModule } from '@nestjs/testing';
import { TokenRepository } from 'src/application/contracts/persistence/token.repository';
import { LogoutUserUseCase } from './logout.user-case';

const mockTokenRepository = () => ({
  create: jest.fn(),
});

describe('LogoutUserUseCase', () => {
  let logoutUserUseCase: LogoutUserUseCase;
  let tokenRepository: jest.Mocked<TokenRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogoutUserUseCase,
        { provide: TokenRepository, useFactory: mockTokenRepository },
      ],
    }).compile();

    logoutUserUseCase = module.get<LogoutUserUseCase>(LogoutUserUseCase);
    tokenRepository = module.get(TokenRepository);
  });

  it('should be defined', () => {
    expect(logoutUserUseCase).toBeDefined();
    expect(tokenRepository).toBeDefined();
  });

  it('should call tokenRepository.create with the correct token', async () => {
    const mockToken = 'test-token';
    tokenRepository.create.mockResolvedValue(true);

    const result = await logoutUserUseCase.execute({ token: mockToken });

    expect(tokenRepository.create).toHaveBeenCalledWith(mockToken);
    expect(result).toBe(true);
  });

  it('should return false if tokenRepository.create returns false', async () => {
    const mockToken = 'invalid-token';
    tokenRepository.create.mockResolvedValue(false);

    const result = await logoutUserUseCase.execute({ token: mockToken });

    expect(tokenRepository.create).toHaveBeenCalledWith(mockToken);
    expect(result).toBe(false);
  });

  it('should throw an error if tokenRepository.create throws', async () => {
    const mockToken = 'error-token';
    const error = new Error('Repository error');

    tokenRepository.create.mockRejectedValue(error);

    await expect(
      logoutUserUseCase.execute({ token: mockToken }),
    ).rejects.toThrow('Repository error');
    expect(tokenRepository.create).toHaveBeenCalledWith(mockToken);
  });
});
