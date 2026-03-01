import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { LoginClienteModule } from 'src/login-cliente/login-cliente.module';
import { LoginProfissionalModule } from 'src/login-profissional/login-profissional.module';
import { PrismaService } from 'src/database/prisma.service';

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_ACCESS_SECRET,
            signOptions: { expiresIn: Number(process.env.JWT_ACCESS_TTL ?? 900) },
        }),
        LoginProfissionalModule,
        LoginClienteModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PrismaService],
})
export class AuthModule {}
