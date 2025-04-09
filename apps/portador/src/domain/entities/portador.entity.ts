import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';
import * as crypto from 'crypto';


export class Portador {
    constructor(
        public readonly id: string,
        public nomeCompleto: string,
        public cpf: string,
        public criadoEm: Date = new Date(),
    ) { }

    static criar(nomeCompleto: string, cpf: string): Portador {
        if (!nomeCompleto || nomeCompleto.trim().length === 0) {
            throw new DomainException(DomainErrors.NOME_OBRIGATORIO);
        }

        if (nomeCompleto.trim().length < 3) {
            throw new DomainException(DomainErrors.NOME_MUITO_CURTO);
        }

        const id = crypto.randomUUID();

        return new Portador(id, nomeCompleto.trim(), cpf);
    }
}
