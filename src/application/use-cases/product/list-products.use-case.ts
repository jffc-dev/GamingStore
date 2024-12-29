import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/application/contracts/persistence/product.repository';
import {
  PageInfo,
  PaginatedProducts,
  ProductEdge,
} from 'src/infraestructure/graphql/dto/product/list-products.dto';

export interface IListProductsUseCaseProps {
  isActive?: boolean;
  first: number;
  after?: string;
  categoryId?: string;
}

@Injectable()
export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(dto: IListProductsUseCaseProps): Promise<PaginatedProducts> {
    const products = await this.productRepository.filterProducts(dto);

    const { first, after } = dto;
    const cursor = after ? { productId: after } : undefined;

    const edges: ProductEdge[] = products.slice(0, first).map((product) => ({
      cursor: product.productId,
      node: {
        id: product.productId,
        name: product.name,
        description: product.description,
        stock: product.stock,
        price: product.price,
        categoryId: product.categoryId,
        isActive: product.isActive,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    }));

    const hasNextPage = products.length > first;
    const hasPreviousPage = !!cursor;

    const pageInfo: PageInfo = {
      hasNextPage,
      hasPreviousPage,
      startCursor: edges.length ? edges[0].cursor : null,
      endCursor: edges.length ? edges[edges.length - 1].cursor : null,
    };

    return { edges, pageInfo };
  }
}
