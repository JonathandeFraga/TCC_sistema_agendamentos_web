import { IsIn, IsString, MinLength } from "class-validator";

export class AuthResetPasswordDto {
    @IsIn(['cliente', 'profissional'])
    tipo: 'cliente' | 'profissional';

    @IsString()
    @MinLength(8)
    fone: string;

    @IsString()
    @MinLength(6)
    token: string;

    @IsString()
    @MinLength(8)
    novaSenha: string;
}