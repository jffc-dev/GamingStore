import { Test, TestingModule } from '@nestjs/testing';
import { LocalFileStorageService } from './local-file-storage.service';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import { join } from 'path';

jest.mock('fs');

describe('LocalFileStorageService', () => {
  let service: LocalFileStorageService;
  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test image content'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalFileStorageService],
    }).compile();

    service = module.get<LocalFileStorageService>(LocalFileStorageService);
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('should successfully upload a file', async () => {
      const imageId = '123';
      const expectedFileName = '123.jpeg';
      const expectedPath = join('static/products/', expectedFileName);

      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

      const result = await service.uploadFile(mockFile, imageId);

      expect(result).toBe(expectedFileName);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedPath,
        mockFile.buffer,
      );
    });

    it('should use custom file path when provided', async () => {
      const imageId = '123';
      const customPath = 'custom/path/';
      const expectedFileName = '123.jpeg';
      const expectedPath = join(customPath, expectedFileName);

      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

      const result = await service.uploadFile(mockFile, imageId, customPath);

      expect(result).toBe(expectedFileName);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expectedPath,
        mockFile.buffer,
      );
    });

    it('should throw InternalServerException when file write fails', async () => {
      const imageId = '123';
      const error = new Error('Write failed');

      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {
        throw error;
      });

      await expect(service.uploadFile(mockFile, imageId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getFilePath', () => {
    it('should return correct file path when file exists', () => {
      const imageName = 'test.jpg';
      const expectedPath = join(
        __dirname,
        '../../../../../static/products/',
        imageName,
      );

      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = service.getFilePath(imageName);

      expect(result).toBe(expectedPath);
      expect(fs.existsSync).toHaveBeenCalledWith(expectedPath);
    });

    it('should throw BadRequestException when file does not exist', () => {
      const imageName = 'nonexistent.jpg';

      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      expect(() => service.getFilePath(imageName)).toThrow(BadRequestException);
      expect(() => service.getFilePath(imageName)).toThrow(
        `No product found with image ${imageName}`,
      );
    });
  });
});
