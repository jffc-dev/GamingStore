import { Injectable } from '@nestjs/common';
import { TokenRepository } from 'src/application/contracts/persistence/token.repository';

interface ILogoutUserUseCase {
  token: string;
}
@Injectable()
export class LogoutUserUseCase {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async execute({ token }: ILogoutUserUseCase): Promise<boolean> {
    const tokenResponse = await this.tokenRepository.create(token);
    return tokenResponse;
  }
}
