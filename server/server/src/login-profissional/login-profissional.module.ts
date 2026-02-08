import { Module } from '@nestjs/common';
import { LoginProfissionalService } from './login-profissional.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    providers: [LoginProfissionalService, PrismaService],
    exports: [LoginProfissionalService],
})
export class LoginProfissionalModule {}