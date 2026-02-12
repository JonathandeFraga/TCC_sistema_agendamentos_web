import { Test, TestingModule } from '@nestjs/testing';
import { DashboardProfissionalController } from './dashboard-profissional.controller';

describe('DashboardProfissionalController', () => {
  let controller: DashboardProfissionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardProfissionalController],
    }).compile();

    controller = module.get<DashboardProfissionalController>(DashboardProfissionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
