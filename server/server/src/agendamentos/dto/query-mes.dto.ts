import { IsInt, IsString, Matches, Min } from "class-validator";

export class QueryMesDto {
    @IsInt()
    @Min(1)
    servicoId: number;

    @IsString()
    @Matches(/^\d{4}-\d{2}$/, { message: 'mes deve estar em YYYY-MM' })
    mes: string;
}