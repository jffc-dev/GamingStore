import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EnvService } from './env.service';
import { Env } from './utils/envSchema';

describe('EnvService', () => {
  let service: EnvService;
  let configService: jest.Mocked<ConfigService<Env, true>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnvService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EnvService>(EnvService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the value from configService', () => {
    const key = 'PG_URL';
    const value = 'postgres://user:password@localhost:5432/db';
    configService.get.mockReturnValue(value);

    const result = service.get(key);

    expect(configService.get).toHaveBeenCalledWith(key, { infer: true });
    expect(result).toBe(value);
  });

  it('should return undefined if key does not exist', () => {
    const key = 'PG_URL';
    configService.get.mockReturnValue(undefined);

    const result = service.get(key);

    expect(configService.get).toHaveBeenCalledWith(key, { infer: true });
    expect(result).toBeUndefined();
  });
});
