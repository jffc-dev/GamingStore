import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { User } from 'src/domain/user';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { ResetPasswordDto } from 'src/infraestructure/http/dto/user/reset-password.dto';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly notificationsService: NotificationsService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({ password, resetToken }: ResetPasswordDto): Promise<any> {
    const userResponse =
      await this.userRepository.findUserByResetToken(resetToken);

    if (!userResponse) {
      throw new BadRequestException('Invalid reset token');
    }

    const { id } = userResponse;
    const hashedPassword = await this.bcryptService.hash(password);
    const updateData: Partial<User> = {
      resetPasswordToken: null,
      resetPasswordExpiresAt: null,
      password: hashedPassword,
    };
    const updatedUser = await this.userRepository.updateUserById(
      id,
      updateData,
    );
    const notificationResponse = await this.notificationsService.sendEmail({
      body: `
        <p>Hello,</p>
        <p>Your password has been successfully reset. If you did not request this change, please contact our support team immediately.</p>
        <p>If you need further assistance, feel free to reach out to us at support@example.com.</p>
        <p>Best regards,<br>GamingStore</p>
      `,
      subject: 'Password Reset Confirmations',
      to: updatedUser.email,
    });

    return notificationResponse;
  }
}
