import { Module } from '@nestjs/common';
import { UuidService } from './uuid.service';

@Module({
  exports: [UuidService],
  providers: [UuidService],
})
export class UuidModule {}
