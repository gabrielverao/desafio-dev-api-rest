import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PortadorResponseDto {
    @ApiProperty({ example: '9dc1c714-4ff6-4211-85d0-2d7d0aa61b55' })
    @Expose()
    id: string;

    @ApiProperty({ example: 'Gabriel VErao' })
    @Expose()
    nomeCompleto: string;

    @ApiProperty({ example: '123.456.789-09' })
    @Expose()
    cpf: string;

    @ApiProperty({ example: '2024-04-05T13:10:00.000Z' })
    @Expose()
    criadoEm: Date;
}
