import { DomainEvent } from '@shared/events/domain-event.interface';

export class ContaDesbloqueadaEvent implements DomainEvent {
    name = 'conta.desbloqueada';
    occurredAt = new Date();

    constructor(
        public payload: {
            id: string;
            cpf: string;
            desbloqueadaEm: Date;
        },
    ) { }
}
