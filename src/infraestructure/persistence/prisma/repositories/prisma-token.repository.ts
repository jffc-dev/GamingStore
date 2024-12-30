import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TokenRepository } from 'src/application/contracts/persistence/token.repository';

@Injectable()
export class PrismaTokenRepository implements TokenRepository {
  constructor(private prisma: PrismaService) {}

  async create(token: string): Promise<boolean> {
    await this.prisma.revokedToken.create({
      data: {
        token,
      },
    });

    return true;
  }

  async existToken(token: string): Promise<boolean> {
    const found = await this.prisma.revokedToken.findUnique({
      where: {
        token,
      },
    });

    return found ? true : false;
  }
}
