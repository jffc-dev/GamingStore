import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import { TokenRepository } from 'src/application/contracts/persistence/token.repository';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Inject(TokenRepository)
    private readonly tokenRepository: TokenRepository,
  ) {
    super();
  }

  getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    } else if ((context.getType() as string) === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    throw new Error('Unsupported context type');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);

    const authHeader: string = request.headers.authorization;
    const token = authHeader.split(' ')[1];
    const invalid = await this.tokenRepository.existToken(token);

    if (invalid) {
      throw new UnauthorizedException();
    }

    return super.canActivate(context) as Promise<boolean>;
  }
}
