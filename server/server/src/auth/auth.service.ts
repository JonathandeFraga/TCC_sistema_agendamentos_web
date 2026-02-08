import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginProfissionalService } from '../login-profissional/login-profissional.service';
import { LoginClienteService } from '../login-cliente/login-cliente.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        private readonly profissionalSvc: LoginProfissionalService,
        private readonly clienteSvc: LoginClienteService,
    ) {}

    async login(data: AuthLoginDto) {
        const user =
            data.tipo === 'profissional'
                ? await this.profissionalSvc.findByFone(data.fone)
                : await this.clienteSvc.findByFone(data.fone);
        
        if (!user) throw new UnauthorizedException('Credenciais inválidas.');

        const ok = await argon2.verify(user.senha, data.senha);
        if (!ok) throw new UnauthorizedException('Credenciais inválidas.');

        const payload = { sub: user.id, typ: data.tipo, fone: user.fone };
        const accessToken = await this.jwt.signAsync(payload);

        return { accessToken, nome: user.nome, tipo: data.tipo };
    }

    async register(data: AuthRegisterDto) {
        const existing =
            data.tipo === 'profissional'
            ? await this.profissionalSvc.findByFone(data.fone)
            : await this.clienteSvc.findByFone(data.fone);

        if (existing) throw new BadRequestException('Telefone já cadastrado');

        const created =
            data.tipo === 'profissional'
                ? await this.profissionalSvc.create({ fone: data.fone, senha: data.senha, nome: data.nome })
                : await this.clienteSvc.create({ fone:data.fone, senha: data.senha, nome: data.nome })

        return created;
    }
}
