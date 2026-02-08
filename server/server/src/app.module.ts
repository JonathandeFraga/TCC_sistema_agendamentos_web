import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginProfissionalModule } from './login-profissional/login-profissional.module';
import { AuthModule } from './auth/auth.module';
import { LoginClienteModule } from './login-cliente/login-cliente.module';

@Module({
  imports: [LoginProfissionalModule, AuthModule, LoginClienteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
