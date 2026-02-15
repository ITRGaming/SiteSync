import { Test, TestingModule } from '@nestjs/testing';
import { PilesController } from './piles.controller';

describe('PilesController', () => {
  let controller: PilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PilesController],
    }).compile();

    controller = module.get<PilesController>(PilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
