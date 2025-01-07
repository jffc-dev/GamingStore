import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma.service';
import { PrismaProductImageRepository } from './prisma-product-image.repository';
import { ProductImage } from 'src/domain/product-image';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('PrismaProductImageRepository', () => {
  let repository: PrismaProductImageRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    productImage: {
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PrismaProductImageRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<PrismaProductImageRepository>(
      PrismaProductImageRepository,
    );
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getImagesByProductIds', () => {
    it('should return an array of ProductImage entities', async () => {
      const mockProductIds = ['1', '2'];
      const mockPrismaImages = [
        { productImageId: 'img1', productId: '1', url: 'url1' },
        { productImageId: 'img2', productId: '2', url: 'url2' },
      ];

      mockPrismaService.productImage.findMany.mockResolvedValue(
        mockPrismaImages,
      );

      const result = await repository.getImagesByProductIds(mockProductIds);

      expect(prismaService.productImage.findMany).toHaveBeenCalledWith({
        where: {
          productId: { in: mockProductIds },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(ProductImage);
      expect(result[0].id).toBe('img1');
      expect(result[1].id).toBe('img2');
    });

    it('should handle database errors', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
      });

      mockPrismaService.productImage.findMany.mockRejectedValue(mockError);

      await expect(repository.getImagesByProductIds(['1'])).rejects.toThrow();
    });
  });

  describe('createProductImage', () => {
    it('should create and return a new ProductImage entity', async () => {
      const mockProductImage = new ProductImage({
        id: 'img1',
        productId: 'prod1',
        url: 'http://example.com/image.jpg',
      });

      const mockPrismaImage = {
        productImageId: 'img1',
        productId: 'prod1',
        url: 'http://example.com/image.jpg',
      };

      mockPrismaService.productImage.create.mockResolvedValue(mockPrismaImage);

      const result = await repository.createProductImage(mockProductImage);

      expect(prismaService.productImage.create).toHaveBeenCalledWith({
        data: {
          productImageId: mockProductImage.id,
          productId: mockProductImage.productId,
          url: mockProductImage.url,
        },
      });
      expect(result).toBeInstanceOf(ProductImage);
      expect(result.id).toBe(mockProductImage.id);
    });

    it('should handle database errors during creation', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
      });

      const mockProductImage = new ProductImage({
        id: 'img1',
        productId: 'prod1',
        url: 'http://example.com/image.jpg',
      });

      mockPrismaService.productImage.create.mockRejectedValue(mockError);

      await expect(
        repository.createProductImage(mockProductImage),
      ).rejects.toThrow();
    });
  });

  describe('getProductImageById', () => {
    it('should return a ProductImage entity when found', async () => {
      const mockPrismaImage = {
        productImageId: 'img1',
        productId: 'prod1',
        url: 'http://example.com/image.jpg',
      };

      mockPrismaService.productImage.findUnique.mockResolvedValue(
        mockPrismaImage,
      );

      const result = await repository.getProductImageById('img1', 'prod1');

      expect(prismaService.productImage.findUnique).toHaveBeenCalledWith({
        where: {
          productImageId: 'img1',
          productId: 'prod1',
        },
      });
      expect(result).toBeInstanceOf(ProductImage);
      expect(result.id).toBe('img1');
    });

    it('should return null when image is not found', async () => {
      mockPrismaService.productImage.findUnique.mockResolvedValue(null);

      const result = await repository.getProductImageById(
        'nonexistent',
        'prod1',
      );

      expect(result).toBeNull();
    });

    it('should handle database errors during find', async () => {
      const mockError = new PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '1.0',
      });

      mockPrismaService.productImage.findUnique.mockRejectedValue(mockError);

      await expect(
        repository.getProductImageById('img1', 'prod1'),
      ).rejects.toThrow();
    });
  });
});
