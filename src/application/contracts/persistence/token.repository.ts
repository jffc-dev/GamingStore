export abstract class TokenRepository {
  abstract create(token: string): Promise<boolean>;
  abstract existToken(token: string): Promise<boolean>;
}
