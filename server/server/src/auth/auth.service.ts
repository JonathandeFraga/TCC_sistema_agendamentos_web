import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginProfissionalService } from '../login-profissional/login-profissional.service';
import { LoginClienteService } from '../login-cliente/login-cliente.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthRegisterDto } from './dto/auth-register.dto';
import * as crypto from 'crypto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwt: JwtService,
        private readonly profissionalSvc: LoginProfissionalService,
        private readonly clienteSvc: LoginClienteService,
        private readonly prisma: PrismaService,
    ) {}

    private hashToken(token: string) {
        return crypto.createHash('sha256').update(token).digest('hex');
    }

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

  async forgotPassword(data: { tipo: 'cliente' | 'profissional'; fone: string }) {
    const { tipo, fone } = data;

    const user =
      tipo === 'profissional'
        ? await this.profissionalSvc.findByFone(fone)
        : await this.clienteSvc.findByFone(fone);

    if (!user) return { ok: true };

    const token = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordReset.updateMany({
      where: { tipo, fone, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });

    await this.prisma.passwordReset.create({
      data: { tipo, fone, tokenHash, expiresAt },
    });

    const allowDevToken = process.env.RESET_DEV_TOKEN === 'true';
    if (allowDevToken) {
      return { ok: true, devToken: token };
    }

    return { ok: true };
  }

  async resetPassword(data: { tipo: 'cliente' | 'profissional'; fone: string; token: string; novaSenha: string }) {
    const { tipo, fone, token, novaSenha } = data;

    const user =
      tipo === 'profissional'
        ? await this.profissionalSvc.findByFone(fone)
        : await this.clienteSvc.findByFone(fone);

    if (!user) return { ok: true };

    const tokenHash = this.hashToken(token);

    const pr = await this.prisma.passwordReset.findFirst({
      where: {
        tipo,
        fone,
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    if (!pr) return { ok: true };

    const senhaHash = await argon2.hash(novaSenha);

    if (tipo === 'profissional') {
      await this.profissionalSvc.updateSenhaById(user.id, senhaHash);
    } else {
      await this.clienteSvc.updateSenhaById(user.id, senhaHash);
    }

    await this.prisma.passwordReset.update({
      where: { id: pr.id },
      data: { usedAt: new Date() },
    });

    return { ok: true };
  }
}
