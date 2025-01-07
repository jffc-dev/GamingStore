import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { EnvService } from 'src/infraestructure/env/env.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { User } from 'src/domain/user';
import {
  FORGOT_PASSWORD_BODY,
  FORGOT_PASSWORD_SUBJECT,
} from 'src/application/utils/constants';
import { ForgotPasswordUseCase } from './forgot-password.use-case';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: UserRepository;
  let envService: EnvService;
  let uuidService: UuidService;
  let notificationsService: NotificationsService;

  const mockUserRepository = {
    findUserByEmail: jest.fn(),
    updateUserById: jest.fn(),
  };

  const mockEnvService = {
    get: jest.fn(),
  };

  const mockUuidService = {
    generateUuid: jest.fn(),
  };

  const mockNotificationsService = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: EnvService,
          useValue: mockEnvService,
        },
        {
          provide: UuidService,
          useValue: mockUuidService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
    envService = module.get<EnvService>(EnvService);
    uuidService = module.get<UuidService>(UuidService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const mockUser = new User({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    lastName: 'Test User',
    password: 'hashedPassword',
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
  });

  const mockResetToken = 'mock-reset-token';
  const mockHostApi = 'http://localhost:3000';
  const mockExpirationMs = 3600000;

  describe('execute', () => {
    beforeEach(() => {
      mockEnvService.get.mockImplementation((key) => {
        switch (key) {
          case 'RESET_PASSWORD_EXPIRATION_MS':
            return mockExpirationMs;
          case 'HOST_API':
            return mockHostApi;
          default:
            return '';
        }
      });
      mockUuidService.generateUuid.mockReturnValue(mockResetToken);
    });

    it('should process forgot password request successfully', async () => {
      const email = 'test@example.com';
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

      const expectedExpirationDate = new Date();
      expectedExpirationDate.setTime(
        expectedExpirationDate.getTime() + mockExpirationMs,
      );

      const expectedUpdatedUser = new User({
        name: mockUser.name,
        lastName: mockUser.lastName,
        email: mockUser.email,
        password: mockUser.password,
        resetPasswordToken: mockResetToken,
        resetPasswordExpiresAt: expectedExpirationDate,
      });

      mockUserRepository.updateUserById.mockResolvedValue(expectedUpdatedUser);

      const result = await useCase.execute({ email });

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(email);
      expect(envService.get).toHaveBeenCalledWith(
        'RESET_PASSWORD_EXPIRATION_MS',
      );
      expect(envService.get).toHaveBeenCalledWith('HOST_API');
      expect(uuidService.generateUuid).toHaveBeenCalled();

      expect(userRepository.updateUserById).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          resetPasswordToken: mockResetToken,
          resetPasswordExpiresAt: expect.any(Date),
        }),
      );

      const expectedResetLink = `${mockHostApi}/reset-password/${mockResetToken}`;
      const expectedEmailBody = FORGOT_PASSWORD_BODY.replace(
        '{{reset_link}}',
        expectedResetLink,
      );

      expect(notificationsService.sendEmail).toHaveBeenCalledWith({
        body: expectedEmailBody,
        subject: FORGOT_PASSWORD_SUBJECT,
        to: email,
      });

      expect(result).toEqual(expectedUpdatedUser);
    });

    it('should throw NotFoundException when user is not found', async () => {
      const email = 'nonexistent@example.com';
      mockUserRepository.findUserByEmail.mockResolvedValue(null);

      await expect(useCase.execute({ email })).rejects.toThrow(
        new NotFoundException('Not found user'),
      );

      expect(userRepository.updateUserById).not.toHaveBeenCalled();
      expect(notificationsService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle database errors during user update', async () => {
      const email = 'test@example.com';
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);
      mockUserRepository.updateUserById.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(useCase.execute({ email })).rejects.toThrow(
        'Database error',
      );
      expect(notificationsService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle notification service errors', async () => {
      const email = 'test@example.com';
      mockUserRepository.findUserByEmail.mockResolvedValue(mockUser);

      const expectedUpdatedUser = new User({
        name: mockUser.name,
        lastName: mockUser.lastName,
        email: mockUser.email,
        password: mockUser.password,
        resetPasswordToken: mockResetToken,
        resetPasswordExpiresAt: expect.any(Date),
      });
      mockUserRepository.updateUserById.mockResolvedValue(expectedUpdatedUser);

      const result = await useCase.execute({ email });

      expect(result).toEqual(expectedUpdatedUser);
      expect(notificationsService.sendEmail).toHaveBeenCalled();
    });
  });
});
