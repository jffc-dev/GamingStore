import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products.use-case';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product.use-case';
import { CreateProductUseCase } from 'src/application/use-cases/product/create-products.use-case';
import { CreateProductInput } from '../../dto/product/inputs/create-product.input';
import { UpdateProductInput } from '../../dto/product/inputs/update-product.input';
import { GetProductDto } from '../../dto/product/get-product.dto';
import { UpdateProductUseCase } from 'src/application/use-cases/product/update-product.use-case';
import { HttpCode, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { DeleteProductUseCase } from 'src/application/use-cases/product/delete-product.use-case';
import { JwtAuthGuard } from 'src/infraestructure/common/guards/jwt-auth.guard';
import { AvailableProductUseCase } from '../../../../application/use-cases/product/avilable-product.use-case';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@Resolver(() => Product)
export class ProductResolver {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly availableProductUseCase: AvailableProductUseCase,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [Product], { name: 'products' })
  async findAll(): Promise<Product[]> {
    const products = await this.listProductsUseCase.execute({});
    return products.map(Product.fromDomainToEntity);
  }

  @Query(() => Product, { name: 'product' })
  async findProduct(@Args() args: GetProductDto): Promise<Product> {
    const { productId } = args;
    const product = await this.getProductUseCase.execute({
      productId,
    });
    return Product.fromDomainToEntity(product);
  }

  @Mutation(() => Product)
  async createProduct(
    @Args('data') data: CreateProductInput,
  ): Promise<Product> {
    const product = await this.createProductUseCase.execute(data);
    return Product.fromDomainToEntity(product);
  }

  @Mutation(() => Product)
  async updateProduct(
    @Args() args: GetProductDto,
    @Args('data') data: UpdateProductInput,
  ): Promise<Product> {
    const product = await this.updateProductUseCase.execute(
      args.productId,
      data,
    );
    return Product.fromDomainToEntity(product);
  }

  @HttpCode(204)
  @Mutation(() => Boolean)
  async deleteProduct(@Args() args: GetProductDto): Promise<boolean> {
    const status = await this.deleteProductUseCase.execute(args);
    return status;
  }

  @Mutation(() => Product)
  async enableProduct(@Args() args: GetProductDto): Promise<Product> {
    const { productId } = args;
    const product = await this.availableProductUseCase.execute({
      productId,
      isActive: true,
    });
    return Product.fromDomainToEntity(product);
  }

  @Mutation(() => Product)
  async disableProduct(@Args() args: GetProductDto): Promise<Product> {
    const { productId } = args;
    const product = await this.availableProductUseCase.execute({
      productId,
      isActive: false,
    });
    return Product.fromDomainToEntity(product);
  }
}
