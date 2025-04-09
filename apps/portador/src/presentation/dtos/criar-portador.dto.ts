import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriarPortadorDto {
    @ApiProperty({
        example: 'João Silva',
        description: 'Nome completo do portador',
    })
    @IsString()
    @IsNotEmpty()
    nomeCompleto: string;

    @ApiProperty({
        example: '123.456.789-09',
        description: 'CPF válido',
    })
    @Matches(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, {
        message: 'CPF deve estar em formato válido',
    })
    cpf: string;
}
