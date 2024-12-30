import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { GetUserByIdUseCase } from 'src/application/use-cases/user/get-user.use-case';
import { User } from 'src/domain/user';
import { JWTPayload } from 'src/infraestructure/common/interfaces/jwt-payload.interface';
import { EnvService } from 'src/infraestructure/env/env.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly envService: EnvService,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {
    super({
      secretOrKey: envService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JWTPayload): Promise<User> {
    const { id } = payload;
    const user = await this.getUserByIdUseCase.execute({ id });
    if (!user) throw new UnauthorizedException('Invalid token');
    return user;
  }
}
