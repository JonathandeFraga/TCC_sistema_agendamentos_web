import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly auth: AuthService) {}

    @Post('login')
    login(@Body() data: AuthLoginDto) {
        return this.auth.login(data);
    }

    @Post('register')
    register(@Body() data: AuthRegisterDto) {
        return this.auth.register(data);
    }

    @Post('forgot-password')
    forgotPassword(@Body() data: AuthForgotPasswordDto) {
        return this.auth.forgotPassword({ tipo: data.tipo, fone: data.fone });
    }

    @Post('reset-password')
    resetPassword(@Body() data: AuthResetPasswordDto) {
        return this.auth.resetPassword({
            tipo: data.tipo,
            fone: data.fone,
            token: data.token,
            novaSenha: data.novaSenha,
        });
    }
}
