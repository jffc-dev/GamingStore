import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { User } from 'src/domain/user';
import { ResetPasswordUseCase } from './reset-password';
import {
  RESET_PASSWORD_BODY,
  RESET_PASSWORD_SUBJECT,
} from 'src/application/utils/constants';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;
  let bcryptService: jest.Mocked<BcryptService>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    password: 'old-hash',
    resetPasswordToken: 'valid-token',
    resetPasswordExpiresAt: new Date(),
  } as User;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: UserRepository,
          useValue: {
            findUserByResetToken: jest.fn(),
            updateUserById: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendEmail: jest.fn(),
          },
        },
        {
          provide: BcryptService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    userRepository = moduleRef.get(UserRepository);
    notificationsService = moduleRef.get(NotificationsService);
    bcryptService = moduleRef.get(BcryptService);
  });

  it('should reset password successfully', async () => {
    const resetToken = 'valid-token';
    const newPassword = 'new-password';
    const hashedPassword = 'new-hash';
    const emailResponse = { success: true };

    userRepository.findUserByResetToken.mockResolvedValue(mockUser);
    bcryptService.hash.mockResolvedValue(hashedPassword);
    const testUser = new User({
      ...mockUser,
      email: 'test@example.com',
      name: 'test',
      lastName: 'test',
      password: hashedPassword,
    });
    userRepository.updateUserById.mockResolvedValue(testUser);
    notificationsService.sendEmail.mockResolvedValue();

    const result = await useCase.execute({
      resetToken,
      password: newPassword,
    });

    expect(userRepository.findUserByResetToken).toHaveBeenCalledWith(
      resetToken,
    );
    expect(bcryptService.hash).toHaveBeenCalledWith(newPassword);
    expect(userRepository.updateUserById).toHaveBeenCalledWith(mockUser.id, {
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      password: hashedPassword,
    });
    expect(notificationsService.sendEmail).toHaveBeenCalledWith({
      body: RESET_PASSWORD_BODY,
      subject: RESET_PASSWORD_SUBJECT,
      to: mockUser.email,
    });
    expect(result).toEqual(emailResponse);
  });

  it('should throw BadRequestException when reset token is invalid', async () => {
    userRepository.findUserByResetToken.mockResolvedValue(null);

    await expect(
      useCase.execute({
        resetToken: 'invalid-token',
        password: 'new-password',
      }),
    ).rejects.toThrow(BadRequestException);

    expect(bcryptService.hash).not.toHaveBeenCalled();
    expect(userRepository.updateUserById).not.toHaveBeenCalled();
    expect(notificationsService.sendEmail).not.toHaveBeenCalled();
  });

  it('should throw error when password hashing fails', async () => {
    userRepository.findUserByResetToken.mockResolvedValue(mockUser);
    bcryptService.hash.mockRejectedValue(new Error('Hashing failed'));

    await expect(
      useCase.execute({
        resetToken: 'valid-token',
        password: 'new-password',
      }),
    ).rejects.toThrow('Hashing failed');
  });

  it('should throw error when user update fails', async () => {
    userRepository.findUserByResetToken.mockResolvedValue(mockUser);
    bcryptService.hash.mockResolvedValue('new-hash');
    userRepository.updateUserById.mockRejectedValue(new Error('Update failed'));

    await expect(
      useCase.execute({
        resetToken: 'valid-token',
        password: 'new-password',
      }),
    ).rejects.toThrow('Update failed');
  });
});
