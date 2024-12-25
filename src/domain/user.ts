import { Entity } from 'src/core/entity';

export interface UserProps {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
  address?: string;
  phoneNumber?: string;
}

export class User extends Entity<UserProps> {
  constructor(props: UserProps) {
    super(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get address(): string {
    return this.props.address;
  }

  get phoneNumber(): string {
    return this.props.phoneNumber;
  }

  get role(): string {
    return this.props.role;
  }
}