import { IsEnum, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class ValidarOperacaoDto {
    @ApiProperty({
        enum: TipoOperacao,
        description: 'Tipo da operação (saque ou deposito)',
        example: TipoOperacao.SAQUE,
    })
    @IsEnum(TipoOperacao)
    tipo: TipoOperacao;

    @ApiProperty({ example: 150, description: 'Valor da operação' })
    @IsNumber()
    @Min(0.01)
    valor: number;

    @ApiProperty({
        example: 500,
        description: 'Total sacado hoje (usar apenas para saques)',
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    totalSacadoHoje?: number;
}
