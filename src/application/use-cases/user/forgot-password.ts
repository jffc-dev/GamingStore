import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { User } from 'src/domain/user';
import { EnvService } from 'src/infraestructure/env/env.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { ForgotPasswordDto } from 'src/infraestructure/http/dto/user/forgot-password.dto';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly envService: EnvService,
    private readonly uuidService: UuidService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute({ email }: ForgotPasswordDto): Promise<User> {
    const userResponse = await this.userRepository.findUserByEmail(email);

    if (!userResponse) {
      throw new NotFoundException('Not found user');
    }

    const expirationMilliseconds = this.envService.get(
      'RESET_PASSWORD_EXPIRATION_MS',
    );

    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() + expirationMilliseconds);
    const { id, ...userRest } = userResponse;
    const updateData: Partial<User> = {
      ...userRest,
      resetPasswordToken: this.uuidService.generateUuid(),
      resetPasswordExpiresAt: expirationDate,
    };
    const updatedUser = await this.userRepository.updateUserById(
      id,
      updateData,
    );

    const hostApi = this.envService.get('HOST_API');
    const resetLink = `${hostApi}/reset-password/${updatedUser.resetPasswordToken}`; // emulate fronend route
    await this.notificationsService.sendEmail({
      body: `
        <p>Hello,</p>
        <p>We received a request to reset your password. Please click the link below to set a new password:</p>
        <p><a href="${resetLink}" style="color: #4CAF50; text-decoration: none;">Reset My Password</a></p>
        <p>If you didn’t request a password reset, you can ignore this email. Your password will remain unchanged.</p>
        <p>For security reasons, this link will expire in 24 hours.</p>
        <p>Best regards,<br>Your Company Name</p>
      `,
      subject: 'Password Reset Request',
      to: updatedUser.email,
    });

    return updatedUser;
  }
}
