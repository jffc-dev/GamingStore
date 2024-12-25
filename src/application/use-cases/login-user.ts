import { Injectable } from '@nestjs/common';
import { UserRepository } from '../contracts/user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/infraestructure/http/dto/login-user.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ password, email }: LoginUserDto): Promise<any> {
    const userResponse = await this.userRepository.findUserByEmail(email);

    const {
      id: userId,
      email: userEmail,
      password: userPassword,
    } = userResponse;

    if (!bcrypt.compareSync(password, userPassword)) {
      throw new Error('Invalid credentials');
    }

    const payload = { id: userId, email: userEmail };
    const accessToken = this.jwtService.sign(payload);

    return { token: accessToken };
  }
}
