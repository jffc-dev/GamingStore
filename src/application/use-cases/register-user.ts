import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/user';
import { UserRepository } from '../contracts/user.repository';
import { v4 as uuid } from 'uuid';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from 'src/infraestructure/http/dto/register-user.dto';

@Injectable()
export class RegisterUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({
    name,
    password,
    email,
    lastName,
    address,
    phoneNumber,
  }: RegisterUserDto): Promise<any> {
    const user = new User({
      id: uuid(),
      name,
      lastName,
      password: bcrypt.hashSync(password, 10),
      email,
      address,
      phoneNumber,
    });

    const response = await this.userRepository.create(user);

    return response;
  }
}
