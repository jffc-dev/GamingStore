import { Module } from '@nestjs/common';
import { LocalFileStorageService } from './local-file-storage.service';
import { FileStorageService } from 'src/domain/adapters/file-storage';

@Module({
  providers: [
    {
      provide: FileStorageService,
      useClass: LocalFileStorageService,
    },
  ],
  exports: [FileStorageService],
  imports: [],
})
export class FileStorageModule {}
