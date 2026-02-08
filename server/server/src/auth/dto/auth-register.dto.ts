import { IsIn, IsString, minLength, MinLength } from "class-validator";

export class AuthRegisterDto {
    @IsIn(['profissiona', 'cliente'])
    tipo: 'profissional' | 'cliente';

    @IsString()
    fone: string;

    @IsString()
    nome: string;

    @IsString()
    @MinLength(4)
    senha: string;
}