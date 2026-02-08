import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/database/prisma.service';
import { loginClienteDto } from './dto/login-cliente.dto';

@Injectable()
export class LoginClienteService {
    constructor(private readonly prisma: PrismaService) {}

    async findByFone(fone: string) {
        return this.prisma.loginCliente.findUnique({
            where: { fone },
            select: { id: true, fone: true, senha: true, nome: true },
        });
    }

    async create(data: loginClienteDto) {
        const senhaHash = await argon2.hash(data.senha);

        return this.prisma.loginCliente.create({
            data: { fone: data.fone, nome: data.nome, senha: senhaHash },
            select: { id:true, fone: true, nome: true },
        });
    }
}
