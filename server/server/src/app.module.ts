import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginProfissionalModule } from './login-profissional/login-profissional.module';

@Module({
  imports: [LoginProfissionalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
