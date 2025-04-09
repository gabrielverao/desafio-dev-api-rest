import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'transacoes' })
export class TransacaoOrmEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Index()
    @Column({ name: 'cpf', length: 11 })
    cpf: string;

    @Column({
        name: 'valor',
        type: 'numeric',
        precision: 10,
        scale: 2,
    })
    valor: number;

    @Column({
        name: 'tipo_operacao',
        type: 'enum',
        enum: TipoOperacao,
    })
    tipo: TipoOperacao;

    @CreateDateColumn({ name: 'realizada_em', type: 'timestamp' })
    realizadaEm: Date;
}
