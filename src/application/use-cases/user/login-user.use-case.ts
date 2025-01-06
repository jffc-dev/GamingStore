import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../../contracts/persistence/user.repository';
import { JwtService } from '@nestjs/jwt';
import { BcryptService } from 'src/infraestructure/services/bcrypt/bcrypt.service';
import { LoginUserDto } from 'src/infraestructure/http/dto/user/login-user.dto';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute({ password, email }: LoginUserDto): Promise<any> {
    const userResponse = await this.userRepository.findUserByEmail(email);

    if (!userResponse) {
      throw new NotFoundException('User not found');
    }

    const {
      id: userId,
      email: userEmail,
      password: userPassword,
    } = userResponse;

    if (!(await this.bcryptService.compare(password, userPassword))) {
      throw new BadRequestException('Invalid credentials');
    }

    const payload = { id: userId, email: userEmail };
    const accessToken = this.jwtService.sign(payload);

    return { token: accessToken };
  }
}
