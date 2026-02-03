import { Test, TestingModule } from '@nestjs/testing';
import { LoginProfissionalService } from './login-profissional.service';

describe('LoginProfissionalService', () => {
  let service: LoginProfissionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginProfissionalService],
    }).compile();

    service = module.get<LoginProfissionalService>(LoginProfissionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
