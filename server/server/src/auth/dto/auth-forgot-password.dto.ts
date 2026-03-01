import { IsIn, IsString, MinLength } from "class-validator";

export class AuthForgotPasswordDto {
    @IsIn(['cliente', 'profissional'])
    tipo: 'cliente' | 'profissional';

    @IsString()
    @MinLength(8)
    fone: string;
}