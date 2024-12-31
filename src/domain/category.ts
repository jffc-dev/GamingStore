import { Entity } from 'src/application/core/entity';

export interface CategoryProps {
  id?: string;
  name?: string;
  description?: string;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Category extends Entity<CategoryProps> {
  constructor(props: CategoryProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string | undefined {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted ?? false;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  set name(name: string | undefined) {
    this.props.name = name;
  }

  set description(description: string | undefined) {
    this.props.description = description;
  }
}
