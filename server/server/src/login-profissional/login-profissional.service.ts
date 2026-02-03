import { Injectable } from '@nestjs/common';
import { loginProfissionalDto } from './dto/login-profissional.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LoginProfissionalService {

    constructor (private prisma: PrismaService) {};
    async create (data: loginProfissionalDto) {
        const loginProfissional = await this.prisma.loginProfissional.create({
            data
        });

        return loginProfissional;
    }
}
