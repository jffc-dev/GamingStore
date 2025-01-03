import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { EnvService } from 'src/infraestructure/env/env.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { NotFoundException } from '@nestjs/common';
import {
  FORGOT_PASSWORD_BODY,
  FORGOT_PASSWORD_SUBJECT,
} from 'src/application/utils/constants';
import { User } from 'src/domain/user';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let envService: jest.Mocked<EnvService>;
  let uuidService: jest.Mocked<UuidService>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockUserProps = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    lastName: 'Test User',
    password: 'hashedPassword',
    resetPasswordToken: null,
    resetPasswordExpiresAt: null,
  };

  const mockUuid = 'mock-uuid-token';
  const mockHostApi = 'http://localhost:3000';
  const mockExpirationMs = 3600000;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: UserRepository,
          useValue: {
            findUserByEmail: jest.fn(),
            updateUserById: jest.fn(),
          },
        },
        {
          provide: EnvService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: UuidService,
          useValue: {
            generateUuid: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    userRepository = module.get(UserRepository);
    envService = module.get(EnvService);
    uuidService = module.get(UuidService);
    notificationsService = module.get(NotificationsService);

    userRepository.findUserByEmail.mockResolvedValue(
      new User({ ...mockUserProps }),
    );
    envService.get.mockImplementation((key) => {
      if (key === 'RESET_PASSWORD_EXPIRATION_MS') return mockExpirationMs;
      if (key === 'HOST_API') return mockHostApi;
      return '';
    });
    uuidService.generateUuid.mockReturnValue(mockUuid);
    userRepository.updateUserById.mockImplementation((id, data) =>
      Promise.resolve(new User({ ...mockUserProps, ...data })),
    );
    notificationsService.sendEmail.mockResolvedValue(undefined);
  });

  describe('execute', () => {
    it('should successfully process forgot password request', async () => {
      const dto = { email: mockUserProps.email };
      const result = await useCase.execute(dto);

      expect(userRepository.findUserByEmail).toHaveBeenCalledWith(dto.email);

      expect(uuidService.generateUuid).toHaveBeenCalled();

      expect(userRepository.updateUserById).toHaveBeenCalledWith(
        mockUserProps.id,
        expect.objectContaining({
          resetPasswordToken: mockUuid,
          resetPasswordExpiresAt: expect.any(Date),
        }),
      );

      const expectedResetLink = `${mockHostApi}/reset-password/${mockUuid}`;
      const expectedEmailBody = FORGOT_PASSWORD_BODY.replace(
        '{{reset_link}}',
        expectedResetLink,
      );

      expect(notificationsService.sendEmail).toHaveBeenCalledWith({
        body: expectedEmailBody,
        subject: FORGOT_PASSWORD_SUBJECT,
        to: mockUserProps.email,
      });

      expect(result).toEqual(
        expect.objectContaining({
          resetPasswordToken: mockUuid,
          resetPasswordExpiresAt: expect.any(Date),
        }),
      );
    });

    it('should throw NotFoundException when user is not found', async () => {
      userRepository.findUserByEmail.mockResolvedValue(null);
      const dto = { email: 'nonexistent@example.com' };

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      await expect(useCase.execute(dto)).rejects.toThrow('Not found user');
    });

    it('should set correct expiration time', async () => {
      const dto = { email: mockUserProps.email };
      const beforeTest = new Date();

      await useCase.execute(dto);

      const updateCall = userRepository.updateUserById.mock.calls[0][1];
      const expirationDate = updateCall.resetPasswordExpiresAt;

      const expectedTime = beforeTest.getTime() + mockExpirationMs;
      expect(expirationDate.getTime()).toBeGreaterThanOrEqual(
        expectedTime - 100,
      );
      expect(expirationDate.getTime()).toBeLessThanOrEqual(expectedTime + 100);
    });

    it('should handle notification service errors', async () => {
      notificationsService.sendEmail.mockRejectedValue(
        new Error('Email error'),
      );
      const dto = { email: mockUserProps.email };

      await expect(useCase.execute(dto)).rejects.toThrow('Email error');
    });
  });
});
