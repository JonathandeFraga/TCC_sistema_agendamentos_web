import { Injectable, UnauthorizedException } from '@nestjs/common';
import { loginProfissionalDto } from './dto/login-profissional.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LoginProfissionalService {

    constructor (private prisma: PrismaService) {};
    async find (data: loginProfissionalDto) {
        const { fone, senha } = data;

        const user = await this.prisma.loginProfissional.findUnique({
            where: { fone },
            select: { id: true, fone: true, senha: true, nome: true },
        });

        if (!user) throw new UnauthorizedException("Credenciais inválidas");
        return {nome: user.nome};
    }
}
