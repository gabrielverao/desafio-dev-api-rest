import { Transacao } from '../../domain/entities/transacao.entity';

export interface ITransacaoRepository {
    salvar(transacao: Transacao): Promise<void>;
    buscarPorCpf(cpf: string): Promise<Transacao[]>;
    buscarPorCpfEPeriodo(cpf: string, inicio: Date, fim: Date): Promise<Transacao[]>;
    calcularTotalSacadoHoje(cpf: string): Promise<number>;
}
