import { User } from 'src/domain/user';

export abstract class UserRepository {
  abstract create(data: User): Promise<User>;
  abstract findUserByEmail(email: string): Promise<User>;
}
