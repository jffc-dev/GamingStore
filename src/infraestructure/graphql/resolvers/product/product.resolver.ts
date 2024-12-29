import {
  Args,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Product } from '../../entities/product.entity';
import { ListProductsUseCase } from 'src/application/use-cases/product/list-products.use-case';
import { GetProductUseCase } from 'src/application/use-cases/product/get-product.use-case';
import { CreateProductUseCase } from 'src/application/use-cases/product/create-products.use-case';
import { CreateProductInput } from '../../dto/product/inputs/create-product.input';
import { UpdateProductInput } from '../../dto/product/inputs/update-product.input';
import { GetProductDto } from '../../dto/product/get-product.dto';
import { UpdateProductUseCase } from 'src/application/use-cases/product/update-product.use-case';
import { HttpCode, UsePipes, ValidationPipe } from '@nestjs/common';
import { DeleteProductUseCase } from 'src/application/use-cases/product/delete-product.use-case';
import { AvailableProductUseCase } from '../../../../application/use-cases/product/avilable-product.use-case';
import { ListProductsFilterDto } from '../../dto/product/list-products.dto';
import { ProductImage } from '../../entities/product-image.entity';
import { ImagesByProductLoader } from './dataloaders/images-by-product.loader';
import { Auth } from 'src/infraestructure/common/decorators/auth.decorator';
import { ValidRoles } from 'src/infraestructure/common/interfaces/valid-roles';
import { Category } from '../../entities/category.entity';
import { CategoryLoader } from './dataloaders/category.loader';

@UsePipes(
  new ValidationPipe({
    transform: true,
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

    private readonly imagesByProductLoader: ImagesByProductLoader,
    private readonly categoryLoader: CategoryLoader,
  ) {}

  @Query(() => [Product], { name: 'products' })
  async findAll(@Args() filters: ListProductsFilterDto): Promise<Product[]> {
    const products = await this.listProductsUseCase.execute({ filters });
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

  @Auth(ValidRoles.manager)
  @Mutation(() => Product)
  async createProduct(
    @Args('data') data: CreateProductInput,
  ): Promise<Product> {
    const product = await this.createProductUseCase.execute(data);
    return Product.fromDomainToEntity(product);
  }

  @Auth(ValidRoles.manager)
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

  @Auth(ValidRoles.manager)
  @HttpCode(204)
  @Mutation(() => Boolean)
  async deleteProduct(@Args() args: GetProductDto): Promise<boolean> {
    const status = await this.deleteProductUseCase.execute(args);
    return status;
  }

  @Auth(ValidRoles.manager)
  @Mutation(() => Product)
  async enableProduct(@Args() args: GetProductDto): Promise<Product> {
    const { productId } = args;
    const product = await this.availableProductUseCase.execute({
      productId,
      isActive: true,
    });
    return Product.fromDomainToEntity(product);
  }

  @Auth(ValidRoles.manager)
  @Mutation(() => Product)
  async disableProduct(@Args() args: GetProductDto): Promise<Product> {
    const { productId } = args;
    const product = await this.availableProductUseCase.execute({
      productId,
      isActive: false,
    });
    return Product.fromDomainToEntity(product);
  }

  @ResolveField(() => [ProductImage], { nullable: true })
  async images(@Parent() product: Product): Promise<ProductImage[]> {
    const images = await this.imagesByProductLoader.load(product.id);
    return images;
  }

  @ResolveField(() => Category)
  async category(@Parent() product: Product): Promise<Category> {
    const category = await this.categoryLoader.load(product.categoryId);
    return Category.fromDomainToEntity(category);
  }
}
