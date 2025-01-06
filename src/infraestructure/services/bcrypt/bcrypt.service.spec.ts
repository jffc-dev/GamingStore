import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let bcryptService: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    bcryptService = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(bcryptService).toBeDefined();
  });

  describe('hash and compare', () => {
    it('should hash a string using bcrypt', async () => {
      const value = 'password123';
      const hashedValue = await bcryptService.hash(value);

      const compare = await bcryptService.compare(value, hashedValue);

      expect(compare).toBe(true);
    });
  });
});
