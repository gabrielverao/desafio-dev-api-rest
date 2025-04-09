import { DomainEvent } from '@shared/events/domain-event.interface';

export class ContaBloqueadaEvent implements DomainEvent {
    name = 'conta.bloqueada';
    occurredAt = new Date();

    constructor(
        public payload: {
            id: string;
            cpf: string;
            bloqueadaEm: Date;
        },
    ) { }
}
