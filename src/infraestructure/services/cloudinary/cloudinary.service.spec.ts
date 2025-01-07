import { Test, TestingModule } from '@nestjs/testing';
import { CloudinaryService } from './cloudinary.service';
import { v2 as cloudinary } from 'cloudinary';

jest.mock('cloudinary');

describe('CloudinaryService', () => {
  let service: CloudinaryService;
  let mockUploadStream: jest.Mock;
  let mockEndStream: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockEndStream = jest.fn();
    mockUploadStream = jest.fn().mockReturnValue({ end: mockEndStream });
    (cloudinary.uploader as any).upload_stream = mockUploadStream;

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile();

    service = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadImage', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      buffer: Buffer.from('test image'),
      size: 1024,
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    it('should successfully upload an image', async () => {
      const expectedResponse = {
        public_id: 'test-id',
        secure_url: 'https://test-url.com/image.jpg',
      };

      mockUploadStream.mockImplementation((options, callback) => {
        callback(null, expectedResponse);
        return { end: mockEndStream };
      });

      const result = await service.uploadImage(mockFile);

      expect(result).toEqual(expectedResponse);
      expect(mockUploadStream).toHaveBeenCalledWith(
        { folder: 'products' },
        expect.any(Function),
      );
      expect(mockEndStream).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should reject with error when upload fails', async () => {
      const expectedError = new Error('Upload failed');

      mockUploadStream.mockImplementation((options, callback) => {
        callback(expectedError, null);
        return { end: mockEndStream };
      });

      await expect(service.uploadImage(mockFile)).rejects.toEqual(
        expectedError,
      );
      expect(mockUploadStream).toHaveBeenCalledWith(
        { folder: 'products' },
        expect.any(Function),
      );
      expect(mockEndStream).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should pass correct folder option to cloudinary', async () => {
      mockUploadStream.mockImplementation((options, callback) => {
        callback(null, {});
        return { end: mockEndStream };
      });

      await service.uploadImage(mockFile);

      expect(mockUploadStream).toHaveBeenCalledWith(
        expect.objectContaining({ folder: 'products' }),
        expect.any(Function),
      );
    });
  });
});
