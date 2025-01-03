import { Test, TestingModule } from '@nestjs/testing';
import { ProductImageController } from './product-image.controller';
import { CreateProductImageUseCase } from 'src/application/use-cases/product-image/create-product-image.use-case';
import { GetProductImageUseCase } from 'src/application/use-cases/product-image/get-product-image.use-case';
import { BadRequestException } from '@nestjs/common';
import { Response } from 'express';
import { ProductImage } from 'src/domain/product-image';

describe('ProductImageController', () => {
  let controller: ProductImageController;
  let createProductImageUseCase: CreateProductImageUseCase;
  let getProductImageUseCase: GetProductImageUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductImageController],
      providers: [
        {
          provide: CreateProductImageUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetProductImageUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProductImageController>(ProductImageController);
    createProductImageUseCase = module.get<CreateProductImageUseCase>(
      CreateProductImageUseCase,
    );
    getProductImageUseCase = module.get<GetProductImageUseCase>(
      GetProductImageUseCase,
    );
  });

  describe('uploadImage', () => {
    it('should call CreateProductImageUseCase with correct data', async () => {
      const file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const productId = 'product123';
      const productImage = new ProductImage({
        id: 'image123',
        productId,
        url: '/path/to/image.jpg',
      });

      jest
        .spyOn(createProductImageUseCase, 'execute')
        .mockResolvedValue(productImage);

      const result = await controller.uploadImage(productId, file);

      expect(createProductImageUseCase.execute).toHaveBeenCalledWith({
        file,
        productId,
      });
      expect(result).toEqual({
        id: productImage.id,
        productId: productImage.productId,
        url: productImage.url,
      });
    });

    it('should throw BadRequestException on error', async () => {
      const file = {
        originalname: 'test.jpg',
        buffer: Buffer.from('test'),
      } as Express.Multer.File;
      const productId = 'product123';

      jest
        .spyOn(createProductImageUseCase, 'execute')
        .mockRejectedValue(new Error('Error'));

      await expect(controller.uploadImage(productId, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getImageById', () => {
    it('should call GetProductImageUseCase with correct data and return the image file', async () => {
      const productId = 'product123';
      const imageId = 'image123';
      const productImage = new ProductImage({
        url: '/path/to/image.jpg',
        productId: 'product-id',
      });
      const res: Partial<Response> = {
        sendFile: jest.fn(),
      };

      jest
        .spyOn(getProductImageUseCase, 'execute')
        .mockResolvedValue(productImage);

      await controller.getImageById(productId, imageId, res as Response);

      expect(getProductImageUseCase.execute).toHaveBeenCalledWith({
        imageId,
        productId,
      });
      expect(res.sendFile).toHaveBeenCalledWith(productImage.url);
    });

    it('should throw BadRequestException on error', async () => {
      const productId = 'product123';
      const imageId = 'image123';
      const res: Partial<Response> = {
        sendFile: jest.fn(),
      };

      jest
        .spyOn(getProductImageUseCase, 'execute')
        .mockRejectedValue(new Error('Error'));

      await expect(
        controller.getImageById(productId, imageId, res as Response),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
