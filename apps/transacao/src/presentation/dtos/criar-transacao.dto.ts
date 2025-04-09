import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, Min, Matches } from 'class-validator';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class CriarTransacaoDto {
  @ApiProperty({
    example: '12345678909',
    description: 'CPF do portador da conta',
  })
  @IsNotEmpty()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter exatamente 11 dígitos' })
  cpf: string;

  @ApiProperty({
    enum: TipoOperacao,
    example: TipoOperacao.SAQUE,
    description: 'Tipo da transação: saque ou deposito',
  })
  @IsEnum(TipoOperacao)
  tipo: TipoOperacao;

  @ApiProperty({
    example: 150.00,
    description: 'Valor da transação (precisa ser maior que 0)',
  })
  @IsNumber()
  @Min(0.01)
  valor: number;
}
