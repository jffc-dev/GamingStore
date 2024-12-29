import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Category as DomainCategory } from 'src/domain/category';

@ObjectType()
export class Category {
  @Field(() => ID)
  categoryId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  isDeleted?: boolean;

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;

  @Field({ nullable: true })
  deletedAt?: Date;

  static fromDomainToEntity(domainObject: DomainCategory): Category {
    return {
      categoryId: domainObject.id,
      name: domainObject.name,
      description: domainObject.description,
      isDeleted: domainObject.isDeleted,
      createdAt: domainObject.createdAt,
      updatedAt: domainObject.updatedAt,
      deletedAt: domainObject.deletedAt,
    };
  }
}
