import { Test, TestingModule } from '@nestjs/testing';
import { PilesService } from './piles.service';

describe('PilesService', () => {
  let service: PilesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PilesService],
    }).compile();

    service = module.get<PilesService>(PilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
