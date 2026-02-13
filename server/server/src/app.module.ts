import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginProfissionalModule } from './login-profissional/login-profissional.module';
import { AuthModule } from './auth/auth.module';
import { LoginClienteModule } from './login-cliente/login-cliente.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { DashboardProfissionalService } from './dashboard-profissional/dashboard-profissional.service';
import { DashboardProfissionalController } from './dashboard-profissional/dashboard-profissional.controller';
import { DashboardProfissionalModule } from './dashboard-profissional/dashboard-profissional.module';

@Module({
  imports: [LoginProfissionalModule, AuthModule, LoginClienteModule, AgendamentosModule, DashboardProfissionalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
