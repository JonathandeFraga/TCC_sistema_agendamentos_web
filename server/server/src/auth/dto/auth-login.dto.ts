import { IsIn, IsString, MinLength } from "class-validator";

export class AuthLoginDto {
    @IsIn(['profissional', 'cliente'])
    tipo: 'profissional' | 'cliente';

    @IsString()
    fone: string;

    @IsString()
    @MinLength(4)
    senha: string;
}