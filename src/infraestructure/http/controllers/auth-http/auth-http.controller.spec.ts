import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from 'src/application/use-cases/user/register-user.use-case';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user.use-case';
import { ForgotPasswordUseCase } from 'src/application/use-cases/user/forgot-password.use-case';
import { ResetPasswordUseCase } from 'src/application/use-cases/user/reset-password.use-case';
import { LogoutUserUseCase } from 'src/application/use-cases/user/logout.use-case';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { AuthController } from './auth-http.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let registerUserUseCase: RegisterUserUseCase;
  let loginUserUseCase: LoginUserUseCase;
  let resetPasswordUseCase: ResetPasswordUseCase;
  let logoutUserUseCase: LogoutUserUseCase;

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

    it('should throw Error on error', async () => {
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
      ).rejects.toThrow(Error);
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

    it('should throw Error on error', async () => {
      jest
        .spyOn(loginUserUseCase, 'execute')
        .mockRejectedValue(new Error('Error'));

      await expect(
        controller.loginUser({ email: '', password: '' }),
      ).rejects.toThrow(Error);
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
});
