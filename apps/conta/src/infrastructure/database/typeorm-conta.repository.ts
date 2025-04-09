import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { ContaOrmEntity } from './conta.orm-entity';
import { Conta } from '../../domain/entities/conta.entity';
import { IContaRepository } from '../../application/interfaces/conta.repository';

@Injectable()
export class TypeOrmContaRepository implements IContaRepository {
    private readonly logger = new Logger(TypeOrmContaRepository.name);

    constructor(
        @InjectRepository(ContaOrmEntity)
        private readonly repo: Repository<ContaOrmEntity>,
    ) { }

    async salvar(conta: Conta): Promise<void> {
        this.logger.log(`Salvando conta no banco: ${conta.numero}`);

        const entidade = this.repo.create({
            id: conta.id,
            cpf: conta.cpf,
            numero: conta.numero,
            agencia: conta.agencia,
            saldo: conta.saldo,
            ativa: conta.ativa,
            bloqueada: conta.bloqueada,
            criadaEm: conta.criadaEm,
            limiteDiario: conta.limiteDiario,
        });

        await this.repo.save(entidade);
    }

    async buscarPorCpf(cpf: string): Promise<Conta | null> {
        const resultado = await this.repo.findOneBy({ cpf });

        if (!resultado) return null;

        return new Conta(
            resultado.id,
            resultado.cpf,
            resultado.numero,
            resultado.agencia,
            +resultado.saldo,
            resultado.ativa,
            resultado.bloqueada,
            resultado.criadaEm,
            +resultado.limiteDiario,
        );
    }
}
