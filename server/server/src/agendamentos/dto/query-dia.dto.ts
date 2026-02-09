import { IsInt, IsString, Matches, Min } from "class-validator";

export class QueryDiaDto {
    @IsInt()
    @Min(1)
    servicoId: number;

    @IsString()
    @Matches(/^d{4}-\d{2}-\d{2}$/, { message: 'data deve estar em YYYY-MM-DD' })
    data: string;
}