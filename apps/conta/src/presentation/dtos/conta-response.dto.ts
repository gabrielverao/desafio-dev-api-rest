import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ContaResponseDto {
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab' })
    @Expose()
    id: string;

    @ApiProperty({ example: '12345678901', description: 'CPF do titular da conta' })
    @Expose()
    cpf: string;

    @ApiProperty({ example: '12345678', description: 'Número da conta' })
    @Expose()
    numero: string;

    @ApiProperty({ example: '0001', description: 'Código da agência bancária' })
    @Expose()
    agencia: string;

    @ApiProperty({ example: 1000.50, description: 'Saldo atual da conta' })
    @Expose()
    saldo: number;

    @ApiProperty({ example: true, description: 'Indica se a conta está ativa' })
    @Expose()
    ativa: boolean;

    @ApiProperty({ example: false, description: 'Indica se a conta está bloqueada' })
    @Expose()
    bloqueada: boolean;

    @ApiProperty({ example: '2025-04-01T12:34:56.789Z', description: 'Data de criação da conta' })
    @Expose()
    criadaEm: Date;

    @ApiProperty({ example: 2000, description: 'Limite diário de transações (ex: saques)' })
    @Expose()
    limiteDiario: number;
}
