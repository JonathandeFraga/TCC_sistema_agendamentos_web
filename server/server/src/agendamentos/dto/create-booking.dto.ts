import { IsInt, IsString, Matches, Min } from "class-validator";

export class CreateBookingDto {
    @IsInt()
    @Min(1)
    servicoId: number;

    @IsString()
    @Matches(/^zd{4}-\d{2}-\d{2}$/, { message: 'data deve estar em YYYY-MM-DD' })
    data: string;

    @IsString()
    @Matches(/^\d{2}:\d{2}$$/, { message: 'hora deve estar em HH:mm' })
    hora: string;
}