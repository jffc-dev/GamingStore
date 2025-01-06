import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user.use-case';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user.use-case';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password.use-case';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password.use-case';
import { LogoutUserUseCase } from 'src/application/use-cases/user/logout.use-case';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { BadRequestException } from '@nestjs/common';
import { AuthController } from './auth-http.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: RegisterUserUseCase;
  let loginUserUseCase: LoginUserUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;
  let logoutUserUseCase: LogoutUserUseCase;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: RegisterUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LoginUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ForgotPasswordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ResetPasswordUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: LogoutUserUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { sendEmail: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    registerUserUseCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);

    resetPasswordUseCase =
      module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    logoutUserUseCase = module.get<LogoutUserUseCase>(LogoutUserUseCase);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  describe('registerUser', () => {
    it('should call RegisterUserUseCase with correct data', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'password123',
        name: '',
        lastName: '',
      };
      const token = 'fake_token';
      jest.spyOn(registerUserUseCase, 'execute').mockResolvedValue({ token });

      const result = await controller.registerUser(dto);

      expect(registerUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ token });
    });

    it('should throw BadRequestException on error', async () => {
      jest
        .spyOn(registerUserUseCase, 'execute')
        .mockRejectedValue(new Error('Error'));

      await expect(
        controller.registerUser({
          email: '',
          password: '',
          name: '',
          lastName: '',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('loginUser', () => {
    it('should call LoginUserUseCase with correct data', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const token = 'fake_token';
      jest.spyOn(loginUserUseCase, 'execute').mockResolvedValue({ token });

      const result = await controller.loginUser(dto);

      expect(loginUserUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ token });
    });

    it('should throw BadRequestException on error', async () => {
      jest
        .spyOn(loginUserUseCase, 'execute')
        .mockRejectedValue(new Error('Error'));

      await expect(
        controller.loginUser({ email: '', password: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logoutUser', () => {
    it('should call LogoutUserUseCase with correct token', async () => {
      const token = 'fake_token';
      jest.spyOn(logoutUserUseCase, 'execute').mockResolvedValue(true);

      const request: any = { headers: { authorization: `Bearer ${token}` } };
      await controller.logoutUser(request);

      expect(logoutUserUseCase.execute).toHaveBeenCalledWith({ token });
    });

    it('should throw BadRequestException if use case fails', async () => {
      jest.spyOn(logoutUserUseCase, 'execute').mockResolvedValue(false);

      const request: any = { headers: { authorization: 'Bearer fake_token' } };
      await expect(controller.logoutUser(request)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should call ResetPasswordUseCase with correct data', async () => {
      const dto = { resetToken: 'reset_token', password: 'new_password123' };
      jest.spyOn(resetPasswordUseCase, 'execute').mockResolvedValue(true);

      const result = await controller.resetPassword(dto);

      expect(resetPasswordUseCase.execute).toHaveBeenCalledWith(dto);
      expect(result).toBe(true);
    });
  });

  describe('valid', () => {
    it('should send an email via NotificationsService', async () => {
      jest
        .spyOn(notificationsService, 'sendEmail')
        .mockResolvedValue(undefined);

      const result = await controller.valid();

      expect(notificationsService.sendEmail).toHaveBeenCalledWith({
        subject: 'Forgot',
        body: 'data',
        to: 'javierflores@ravn.co',
      });
      expect(result).toBe(1);
    });
  });
});
