import { Test, TestingModule } from '@nestjs/testing';
import { PileReportController } from './pile-report.controller';

describe('PileReportController', () => {
  let controller: PileReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PileReportController],
    }).compile();

    controller = module.get<PileReportController>(PileReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
