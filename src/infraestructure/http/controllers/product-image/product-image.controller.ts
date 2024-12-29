import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CreateProductImageUseCase } from 'src/application/use-cases/product-image/create-product-image.use-case';
import { GetProductImageUseCase } from 'src/application/use-cases/product-image/get-product-image.use-case';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator';
import { ValidRoles } from 'src/infraestructure/common/interfaces/valid-roles';

@Controller('api/products/:productId/images')
export class ProductImageController {
  constructor(
    private readonly getProductImageUseCase: GetProductImageUseCase,
    private readonly createProductImageUseCase: CreateProductImageUseCase,
  ) {}

  @Auth(ValidRoles.manager)
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 1000000 },
    }),
  )
  async uploadImage(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const productImage = await this.createProductImageUseCase.execute({
      file,
      productId,
    });

    return {
      id: productImage.id,
      productId: productImage.productId,
      url: productImage.url,
    };
  }

  @Get(':imageId')
  async getImageById(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
    @Res() res: Response,
  ) {
    const productImage = await this.getProductImageUseCase.execute({
      imageId,
      productId,
    });
    res.sendFile(productImage.url);
  }
}
