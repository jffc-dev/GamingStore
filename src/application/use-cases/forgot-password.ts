import { Injectable } from '@nestjs/common';
import { UserRepository } from '../contracts/persistence/user.repository';
import { ForgotPasswordDto } from 'src/infraestructure/http/dto/forgot-password.dto';
import { User } from 'src/domain/user';
import { EnvService } from 'src/infraestructure/env/env.service';
import { NotificationsService } from 'src/infraestructure/notifications/notifications.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly envService: EnvService,
    private readonly notificationsService: NotificationsService,
    private readonly uuidService: UuidService,
  ) {}

  async execute({ email }: ForgotPasswordDto): Promise<any> {
    const userResponse = await this.userRepository.findUserByEmail(email);

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
    console.log(updatedUser.resetPasswordToken);
    const notificationResponse = await this.notificationsService.sendEmailTest(
      updatedUser.email,
      'subject',
      'body',
    );

    return notificationResponse;
  }
}
