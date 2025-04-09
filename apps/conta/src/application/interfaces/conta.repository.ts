import { Conta } from '../../domain/entities/conta.entity';

export interface IContaRepository {
    salvar(conta: Conta): Promise<void>;
    buscarPorCpf(cpf: string): Promise<Conta | null>;
}
