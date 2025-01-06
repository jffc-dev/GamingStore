import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { User } from 'src/domain/user';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { ResetPasswordDto } from 'src/infraestructure/http/dto/user/reset-password.dto';
import {
  RESET_PASSWORD_BODY,
  RESET_PASSWORD_SUBJECT,
} from 'src/application/utils/constants';

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
    await this.notificationsService.sendEmail({
      body: RESET_PASSWORD_BODY,
      subject: RESET_PASSWORD_SUBJECT,
      to: updatedUser.email,
    });

    return true;
  }
}
