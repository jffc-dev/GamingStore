import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';
import { FileStorageService } from 'src/domain/adapters/file-storage.interface';

@Injectable()
export class LocalFileStorageService extends FileStorageService {
  constructor() {
    super();
  }

  private readonly uploadPath = 'static/products/';

  async uploadFile(
    file: Express.Multer.File,
    imageId: string,
    filePath = this.uploadPath,
  ): Promise<string> {
    try {
      const fileExtension = file.mimetype.split('/')[1];
      const fileName = `${imageId}.${fileExtension}`;
      const fullPath = join(filePath, fileName);

      fs.writeFileSync(fullPath, file.buffer);
      return fileName;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  getFilePath(imageName: string) {
    const path = join(
      __dirname,
      `../../../../../${this.uploadPath}`,
      imageName,
    );
    if (!fs.existsSync(path)) {
      throw new BadRequestException(`No product found with image ${imageName}`);
    }
    return path;
  }
}
