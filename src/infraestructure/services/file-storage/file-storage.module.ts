import { Module } from '@nestjs/common';
import { FileStorageService } from 'src/domain/adapters/file-storage.interface';
import { CloudinaryStorageService } from './cloudinary-file-storage.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { EnvModule } from 'src/infraestructure/env/env.module';
import { EnvService } from 'src/infraestructure/env/env.service';

@Module({
  providers: [
    {
      provide: FileStorageService,
      useClass: CloudinaryStorageService,
    },
  ],
  exports: [FileStorageService],
  imports: [
    CloudinaryModule.registerAsync({
      imports: [EnvModule],
      inject: [EnvService],
      useFactory: (envService: EnvService) => {
        console.log(envService.get('CLOUDINARY_CLOUD_NAME'));
        return {
          cloud_name: envService.get('CLOUDINARY_CLOUD_NAME'),
          api_key: envService.get('CLOUDINARY_API_KEY'),
          api_secret: envService.get('CLOUDINARY_API_SECRET'),
        };
      },
    }),
  ],
})
export class FileStorageModule {}
