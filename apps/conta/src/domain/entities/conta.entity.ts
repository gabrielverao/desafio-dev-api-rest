import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';
import * as crypto from 'crypto';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class Conta {
    constructor(
        public readonly id: string,
        public readonly cpf: string,
        public readonly numero: string,
        public readonly agencia: string,
        public saldo: number,
        public ativa: boolean,
        public bloqueada: boolean,
        public criadaEm: Date,
        public readonly limiteDiario: number = 2000,
    ) { }

    static criar(cpf: string): Conta {
        const id = crypto.randomUUID();
        const numero = Conta.gerarNumeroConta();
        const agencia = '0001';
        const saldo = 0;
        const ativa = true;
        const bloqueada = false;
        const criadaEm = new Date();
        const limiteDiario = 2000;        

        return new Conta(id, cpf, numero, agencia, saldo, ativa, bloqueada, criadaEm, limiteDiario);
    }

    static gerarNumeroConta(): string {
        return Math.floor(10000000 + Math.random() * 90000000).toString();
    }

    bloquear(): void {
        if (!this.ativa)
            throw new DomainException(DomainErrors.CONTA_INATIVA);

        if (this.bloqueada)
            throw new DomainException(DomainErrors.CONTA_JA_BLOQUEADA);

        this.bloqueada = true;
    }

    desbloquear(): void {
        if (!this.ativa)
            throw new DomainException(DomainErrors.CONTA_INATIVA);

        if (!this.bloqueada)
            throw new DomainException(DomainErrors.CONTA_JA_BLOQUEADA);

        this.bloqueada = false;
    }

    encerrar(): void {
        if (!this.ativa)
            throw new DomainException(DomainErrors.CONTA_JA_ENCERRADA);        

        if (this.saldo > 0) {
            throw new DomainException(DomainErrors.CONTA_COM_SALDO);
        }

        this.ativa = false;
    }

    ativar(): void {
        if (this.ativa)
            throw new DomainException(DomainErrors.CONTA_JA_ATIVA);        

        this.ativa = true;
    }

    sacar(valor: number, totalSacadoHoje: number): void {
        this.validarOperacao(TipoOperacao.SAQUE, valor, totalSacadoHoje);
        this.saldo -= valor;
    }

    depositar(valor: number): void {
        this.validarOperacao(TipoOperacao.DEPOSITO, valor, 0);
        this.saldo += valor;
    }

    /**
     * Valida se a conta pode realizar uma operação.
     * 
     * @param tipo 'saque' | 'deposito'
     * @param valor Valor da operação
     * @param totalSacadoHoje total ja sacado
     */
    validarOperacao(tipo: TipoOperacao, valor: number, totalSacadoHoje: number): void {
        if (!this.ativa) {
            throw new DomainException(DomainErrors.CONTA_INATIVA);
        }

        if (this.bloqueada) {
            throw new DomainException(DomainErrors.CONTA_BLOQUEADA);
        }

        if (tipo === 'saque') {
            if (this.saldo < valor) {
                throw new DomainException(DomainErrors.SALDO_INSUFICIENTE);
            }

            const novoTotal = totalSacadoHoje + valor;
            if (novoTotal > this.limiteDiario) {
                throw new DomainException(DomainErrors.LIMITE_DIARIO_EXCEDIDO);
            }
        }
    }
}
