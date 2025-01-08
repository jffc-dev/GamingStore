import { ClsStore } from 'nestjs-cls';
import { Prisma } from '@prisma/client';

export const PRISMA_TX_CLIENT_KEY = 'PRISMA_TX_CLIENT_KEY';

export interface MyClsStore extends ClsStore {
  [PRISMA_TX_CLIENT_KEY]?: Prisma.TransactionClient;
}
