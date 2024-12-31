import { DynamicModule, Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

@Module({})
export class CloudinaryModule {
  static registerAsync(options: {
    imports?: any[];
    inject?: any[];
    useFactory: (...args: any[]) => Promise<any> | any;
  }): DynamicModule {
    const cloudinaryProvider = {
      provide: 'CLOUDINARY',
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);
        cloudinary.config(config);
        return cloudinary;
      },
      inject: options.inject || [],
    };

    return {
      module: CloudinaryModule,
      imports: options.imports || [],
      providers: [cloudinaryProvider, CloudinaryService],
      exports: [cloudinaryProvider, CloudinaryService],
    };
  }
}
