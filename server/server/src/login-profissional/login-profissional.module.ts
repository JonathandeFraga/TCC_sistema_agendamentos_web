import { Module } from '@nestjs/common';
import { LoginProfissionalService } from './login-profissional.service';
import { LoginProfissionalController } from './login-profissional.controller';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    providers: [LoginProfissionalService, PrismaService],
    controllers: [LoginProfissionalController]
})
export class LoginProfissionalModule {}