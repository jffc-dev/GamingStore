import { join } from 'path';
import { Module } from '@nestjs/common';
import { ProductModule } from './resolvers/product/product.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CartDetailModule } from './resolvers/cart-detail/cart-detail.module';
import { LikeModule } from './resolvers/like/like.module';

@Module({
  imports: [
    ProductModule,
    CartDetailModule,
    LikeModule,

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
  ],
  providers: [],
})
export class GraphqlModule {}
