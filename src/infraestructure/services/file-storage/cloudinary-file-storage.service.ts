import {
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { FileStorageService } from 'src/domain/adapters/file-storage';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CloudinaryStorageService extends FileStorageService {
  constructor(private readonly cloudinaryService: CloudinaryService) {
    super();
  }

  private readonly uploadPath = '';

  async uploadFile(file: Express.Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImage(file);
      return result.secure_url;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getFilePath(): string {
    throw new NotImplementedException('Not implemented');
  }
}
