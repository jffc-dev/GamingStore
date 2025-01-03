import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { User } from 'src/domain/user';
import { EnvService } from 'src/infraestructure/env/env.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { ForgotPasswordDto } from 'src/infraestructure/http/dto/user/forgot-password.dto';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import {
  FORGOT_PASSWORD_BODY,
  FORGOT_PASSWORD_SUBJECT,
} from 'src/application/utils/constants';

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
    let emailBody = FORGOT_PASSWORD_BODY;
    emailBody = emailBody.replace('{{reset_link}}', resetLink);

    await this.notificationsService.sendEmail({
      body: emailBody,
      subject: FORGOT_PASSWORD_SUBJECT,
      to: updatedUser.email,
    });

    return updatedUser;
  }
}
