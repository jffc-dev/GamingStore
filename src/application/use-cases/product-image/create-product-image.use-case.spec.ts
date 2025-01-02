import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProductImageRepository } from 'src/application/contracts/persistence/product-image.repository';
import { FileStorageService } from 'src/domain/adapters/file-storage';
import { UuidService } from 'src/infraestructure/services/uuid/uuid.service';
import { ProductImage } from 'src/domain/product-image';
import { CreateProductImageUseCase } from './create-product-image.use-case';

describe('CreateProductImageUseCase', () => {
  let useCase: CreateProductImageUseCase;
  let productImageRepository: jest.Mocked<ProductImageRepository>;
  let fileStorageService: jest.Mocked<FileStorageService>;
  let uuidService: jest.Mocked<UuidService>;

  const mockFile = {
    fieldname: 'file',
    originalname: 'test.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test'),
    size: 1024,
  } as Express.Multer.File;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateProductImageUseCase,
        {
          provide: ProductImageRepository,
          useValue: {
            createProductImage: jest.fn(),
          },
        },
        {
          provide: FileStorageService,
          useValue: {
            validateFile: jest.fn(),
            uploadFile: jest.fn(),
          },
        },
        {
          provide: UuidService,
          useValue: {
            generateUuid: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<CreateProductImageUseCase>(
      CreateProductImageUseCase,
    );
    productImageRepository = moduleRef.get(ProductImageRepository);
    fileStorageService = moduleRef.get(FileStorageService);
    uuidService = moduleRef.get(UuidService);
  });

  it('should create a product image successfully', async () => {
    const productId = 'product-123';
    const imageId = 'image-123';
    const imagePath = 'path/to/image.jpg';

    fileStorageService.validateFile.mockReturnValue(true);
    uuidService.generateUuid.mockReturnValue(imageId);
    fileStorageService.uploadFile.mockResolvedValue(imagePath);

    const expectedProductImage = new ProductImage({
      id: imageId,
      productId,
      url: imagePath,
    });

    productImageRepository.createProductImage.mockResolvedValue(
      expectedProductImage,
    );

    const result = await useCase.execute({
      productId,
      file: mockFile,
    });

    expect(fileStorageService.validateFile).toHaveBeenCalledWith(mockFile);
    expect(uuidService.generateUuid).toHaveBeenCalled();
    expect(fileStorageService.uploadFile).toHaveBeenCalledWith(
      mockFile,
      imageId,
    );
    expect(productImageRepository.createProductImage).toHaveBeenCalledWith(
      expectedProductImage,
    );
    expect(result).toEqual(expectedProductImage);
  });

  it('should throw BadRequestException when file is invalid', async () => {
    fileStorageService.validateFile.mockReturnValue(false);

    await expect(
      useCase.execute({
        productId: 'product-123',
        file: mockFile,
      }),
    ).rejects.toThrow(BadRequestException);

    expect(fileStorageService.validateFile).toHaveBeenCalledWith(mockFile);
    expect(fileStorageService.uploadFile).not.toHaveBeenCalled();
    expect(productImageRepository.createProductImage).not.toHaveBeenCalled();
  });

  it('should throw error when file upload fails', async () => {
    fileStorageService.validateFile.mockReturnValue(true);
    fileStorageService.uploadFile.mockRejectedValue(new Error('Upload failed'));

    await expect(
      useCase.execute({
        productId: 'product-123',
        file: mockFile,
      }),
    ).rejects.toThrow('Upload failed');
  });
});
