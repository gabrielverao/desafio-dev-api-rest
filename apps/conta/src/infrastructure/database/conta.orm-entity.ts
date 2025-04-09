import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity({ name: 'contas' })
export class ContaOrmEntity {
    @PrimaryGeneratedColumn('uuid', { name: 'id' })
    id: string;

    @Index()
    @Column({ length: 11, name: 'cpf' })
    cpf: string;

    @Column({ length: 8, name: 'numero' })
    numero: string;

    @Column({ length: 4, name: 'agencia' })
    agencia: string;

    @Column({
        name: 'saldo',
        type: 'numeric',
        precision: 10,
        scale: 2,
        default: 0,
    })
    saldo: number;

    @Column({ name: 'ativa', default: true })
    ativa: boolean;

    @Column({ name: 'bloqueada', default: false })
    bloqueada: boolean;

    @CreateDateColumn({ name: 'criada_em', type: 'timestamp' })
    criadaEm: Date;

    @Column({
        name: 'limite_diario',
        type: 'numeric',
        precision: 10,
        scale: 2,
        default: 2000,
    })
    limiteDiario: number;
}
