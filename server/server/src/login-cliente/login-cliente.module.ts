import { Module } from '@nestjs/common';
import { LoginClienteService } from './login-cliente.service';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    providers: [LoginClienteService, PrismaService],
    exports: [LoginClienteService],
})
export class LoginClienteModule {}
