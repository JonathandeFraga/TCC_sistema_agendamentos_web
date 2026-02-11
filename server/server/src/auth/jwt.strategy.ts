import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = { sub: number; typ: 'cliente' | 'profissional'; fone?: string }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        const secret = process.env.JWT_ACCESS_SECRET;
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET não definido  no ambiente.');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload: JwtPayload) {
        return { userId: payload.sub, tipo: payload.typ, fone: payload.fone };
    }
}