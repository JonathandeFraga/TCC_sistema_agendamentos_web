import { Test, TestingModule } from '@nestjs/testing';
import { LoginProfissionalController } from './login-profissional.controller';

describe('LoginProfissionalController', () => {
  let controller: LoginProfissionalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginProfissionalController],
    }).compile();

    controller = module.get<LoginProfissionalController>(LoginProfissionalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
