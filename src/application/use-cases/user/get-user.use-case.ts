import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/application/contracts/persistence/user.repository';
import { User } from 'src/domain/user';

interface GetUserByIdUseCaseProps {
  id: string;
}
@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute({ id }: GetUserByIdUseCaseProps): Promise<User> {
    const userResponse = await this.userRepository.findOneBy(id);

    return userResponse;
  }
}
