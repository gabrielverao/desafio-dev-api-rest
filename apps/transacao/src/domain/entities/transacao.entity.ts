import * as crypto from 'crypto';
import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class Transacao {
    constructor(
        public readonly id: string,
        public readonly cpf: string,
        public readonly valor: number,
        public readonly tipo: TipoOperacao,
        public readonly realizadaEm: Date,
    ) { }

    static criar(cpf: string, valor: number, tipo: TipoOperacao): Transacao {
        if (valor <= 0) {
            throw new DomainException(DomainErrors.VALOR_INVALIDO);
        }

        const cpfLimpo = cpf.replace(/\D/g, '');

        if (cpfLimpo.length !== 11) {
            throw new DomainException(DomainErrors.CPF_INVALIDO);
        }

        const id = crypto.randomUUID();
        const realizadaEm = new Date();

        return new Transacao(id, cpfLimpo, valor, tipo, realizadaEm);
    }
}
