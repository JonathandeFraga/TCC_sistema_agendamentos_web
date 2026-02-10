import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginProfissionalModule } from './login-profissional/login-profissional.module';
import { AuthModule } from './auth/auth.module';
import { LoginClienteModule } from './login-cliente/login-cliente.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';

@Module({
  imports: [LoginProfissionalModule, AuthModule, LoginClienteModule, AgendamentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
