import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { User } from 'src/domain/user';

interface GetUserByIdUseCaseProps {
  id: string;
}
@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ id }: GetUserByIdUseCaseProps): Promise<User> {
    const userResponse = await this.userRepository.findOneById(id);
    if (!userResponse) {
      throw new NotFoundException('User not found');
    }

    return userResponse;
  }
}
