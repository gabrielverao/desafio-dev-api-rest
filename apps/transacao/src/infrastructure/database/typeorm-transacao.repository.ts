import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { ITransacaoRepository } from '../../application/interfaces/transacao.repository';
import { TransacaoOrmEntity } from './transacao.orm-entity';
import { Transacao } from '../../domain/entities/transacao.entity';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

@Injectable()
export class TypeOrmTransacaoRepository implements ITransacaoRepository {
    private readonly logger = new Logger(TypeOrmTransacaoRepository.name);

    constructor(
        @InjectRepository(TransacaoOrmEntity)
        private readonly repo: Repository<TransacaoOrmEntity>,
    ) { }

    async salvar(transacao: Transacao): Promise<void> {
        this.logger.log(`Salvando transação: ${transacao.id}`);
        const entity = this.repo.create({
            id: transacao.id,
            cpf: transacao.cpf,
            valor: transacao.valor,
            tipo: transacao.tipo,
            realizadaEm: transacao.realizadaEm,
        });

        await this.repo.save(entity);
    }

    async buscarPorCpf(cpf: string): Promise<Transacao[]> {
        const result = await this.repo.find({ where: { cpf } });

        return result.map(
            (t) =>
                new Transacao(t.id, t.cpf, +t.valor, t.tipo as TipoOperacao, t.realizadaEm),
        );
    }

    async buscarPorCpfEPeriodo(cpf: string, inicio: Date, fim: Date): Promise<Transacao[]> {
        const result = await this.repo.find({
            where: {
                cpf,
                realizadaEm: Between(inicio, fim),
            },
            order: { realizadaEm: 'DESC' },
        });

        return result.map(
            (t) =>
                new Transacao(t.id, t.cpf, +t.valor, t.tipo as TipoOperacao, t.realizadaEm),
        );
    }

    async calcularTotalSacadoHoje(cpf: string): Promise<number> {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);

        const result = await this.repo.find({
            where: {
                cpf,
                tipo: TipoOperacao.SAQUE,
                realizadaEm: Between(hoje, amanha),
            },
        });

        return result.reduce((total, t) => total + +t.valor, 0);
    }

    async buscarUltimasTransacoes(cpf: string, limite: number): Promise<Transacao[]> {
        const result = await this.repo.find({
            where: { cpf },
            order: { realizadaEm: 'DESC' },
            take: limite,
        });

        return result.map(
            (t) =>
                new Transacao(t.id, t.cpf, +t.valor, t.tipo as TipoOperacao, t.realizadaEm),
        );
    }
}
