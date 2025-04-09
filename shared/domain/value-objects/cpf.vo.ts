import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';

export class Cpf {
    private readonly value: string;

    constructor(cpf: string) {
        const cpfLimpo = cpf.replace(/\D/g, '');

        if (!this.validarCpf(cpfLimpo)) {
            throw new DomainException(DomainErrors.CPF_INVALIDO);
        }

        this.value = cpfLimpo;
    }

    get raw(): string {
        return this.value;
    }

    private validarCpf(cpf: string): boolean {
        return /^\d{11}$/.test(cpf);
    }

    toString(): string {
        return this.value;
    }
}
