import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(prismaService).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call $connect when module is initialized', async () => {
      const connectSpy = jest
        .spyOn(prismaService, '$connect')
        .mockResolvedValue();

      await prismaService.onModuleInit();

      expect(connectSpy).toHaveBeenCalled();
      expect(connectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call $disconnect when module is destroyed', async () => {
      const disconnectSpy = jest
        .spyOn(prismaService, '$disconnect')
        .mockResolvedValue();

      await prismaService.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalled();
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });
});
