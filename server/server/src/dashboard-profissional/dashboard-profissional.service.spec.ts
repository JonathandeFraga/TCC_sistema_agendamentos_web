import { Test, TestingModule } from '@nestjs/testing';
import { DashboardProfissionalService } from './dashboard-profissional.service';

describe('DashboardProfissionalService', () => {
  let service: DashboardProfissionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardProfissionalService],
    }).compile();

    service = module.get<DashboardProfissionalService>(DashboardProfissionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
