import { IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultarExtratoDto {
    @ApiProperty({ example: '12345678909', description: 'CPF do titular da conta' })
    @IsString()
    cpf: string;

    @ApiProperty({ example: '2025-04-08T00:00:00.000Z', description: 'Data de início do período (formato ISO)' })
    @IsDateString()
    inicio: string;

    @ApiProperty({ example: '2025-04-08T23:59:59.999Z', description: 'Data de fim do período (formato ISO)' })
    @IsDateString()
    fim: string;
}
