import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/user';
import { UserRepository } from '../contracts/persistence/user.repository';
import { RegisterUserDto } from 'src/infraestructure/http/dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
    private readonly uuidService: UuidService,
  ) {}

  async execute({
    name,
    password,
    email,
    lastName,
    address,
    phoneNumber,
  }: RegisterUserDto): Promise<any> {
    const hashedPassword = await this.bcryptService.hash(password);
    const user = new User({
      id: this.uuidService.generateUuid(),
      name,
      lastName,
      password: hashedPassword,
      email,
      address,
      phoneNumber,
    });

    const userResponse = await this.userRepository.create(user);
    const { email: userEmail, id: userId } = userResponse;

    const payload = { id: userId, email: userEmail };
    const accessToken = this.jwtService.sign(payload);

    return { token: accessToken };
  }
}
