import { Body, Controller, Post } from '@nestjs/common';
import { LoginProfissionalService } from './login-profissional.service';
import type { loginProfissionalDto } from './dto/login-profissional.dto';

@Controller('login-profissional')
export class LoginProfissionalController {

    constructor (private readonly loginProfissionalService: LoginProfissionalService) {}
    @Post()
    async create(@Body() data: loginProfissionalDto) {
        return this.loginProfissionalService.create(data);
    }
}
