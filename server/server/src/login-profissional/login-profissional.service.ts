import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loginProfissionalDto } from './dto/login-profissional.dto';
import { PrismaService } from 'src/database/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class LoginProfissionalService {

    constructor (private readonly prisma: PrismaService) {};
    async findByFone (fone: string) {
        return this.prisma.loginProfissional.findUnique({
            where: { fone },
            select: { id: true, fone: true, senha: true, nome: true },
        });
    };

    async create(data: loginProfissionalDto) {
        const senhaHash = await argon2.hash(data.senha);

        return this.prisma.loginProfissional.create({
            data: { fone: data.fone, nome: data.nome, senha: senhaHash },
            select: { id: true, fone: true, nome: true },
        });
    }

    async updateSenhaById(id: number, senhaHash: string) {
        return this.prisma.loginProfissional.update({
            where: { id },
            data: { senha: senhaHash },
        });
    }
}
