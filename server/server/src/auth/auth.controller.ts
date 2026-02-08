import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';

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
}
