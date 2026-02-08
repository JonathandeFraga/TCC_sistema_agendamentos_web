import { Test, TestingModule } from '@nestjs/testing';
import { LoginClienteService } from './login-cliente.service';

describe('LoginClienteService', () => {
  let service: LoginClienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginClienteService],
    }).compile();

    service = module.get<LoginClienteService>(LoginClienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
