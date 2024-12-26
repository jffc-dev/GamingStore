import { Injectable } from '@nestjs/common';
import { IUuidService } from 'src/domain/adapters/uuid.interface';
import { v4 as uuid } from 'uuid';

@Injectable()
export class UuidService implements IUuidService {
  generateUuid(): string {
    return uuid();
  }
}
