import { Test, TestingModule } from '@nestjs/testing';
import { PileReportService } from './pile-report.service';

describe('PileReportService', () => {
  let service: PileReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PileReportService],
    }).compile();

    service = module.get<PileReportService>(PileReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
