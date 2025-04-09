import { DomainEvent } from '@shared/events/domain-event.interface';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class TransacaoCriadaEvent implements DomainEvent {
    name = 'transacao.criada';
    occurredAt = new Date();

    constructor(
        public payload: {
            id: string;
            cpf: string;
            valor: number;
            tipo: TipoOperacao;
            realizadaEm: Date;
        },
    ) { }
}
