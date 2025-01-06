import { Test, TestingModule } from '@nestjs/testing';
import { UuidService } from './uuid.service';

describe('UuidService', () => {
  let service: UuidService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UuidService],
    }).compile();

    service = module.get<UuidService>(UuidService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a string', () => {
    const uuid = service.generateUuid();
    expect(typeof uuid).toBe('string');
  });

  it('should return a valid UUID', () => {
    const uuid = service.generateUuid();
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(uuid)).toBe(true);
  });
});
