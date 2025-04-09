import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('portadores')
export class PortadorOrmEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'nome_completo' })
  nomeCompleto: string;

  @Column({ unique: true, name: 'cpf' })
  cpf: string;

  @Column({ type: 'timestamp', name: 'criado_em' })
  criadoEm: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'data_exclusao', nullable: true })
  dataExclusao?: Date;
}
