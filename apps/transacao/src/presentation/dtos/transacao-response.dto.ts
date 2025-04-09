import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class TransacaoResponseDto {
    @ApiProperty({ example: 'b250f429-1c80-4a5a-88cb-1e47ff9f52d4' })
    @Expose()
    id: string;

    @ApiProperty({ example: '12345678900' })
    @Expose()
    cpf: string;

    @ApiProperty({ example: 250.75 })
    @Expose()
    valor: number;

    @ApiProperty({
        enum: TipoOperacao,
        example: TipoOperacao.SAQUE,
    })
    @Expose()
    tipo: TipoOperacao;

    @ApiProperty({ example: '2025-04-07T13:22:15.000Z' })
    @Expose({ name: 'realizadaEm' })
    realizadaEm: Date;
}
