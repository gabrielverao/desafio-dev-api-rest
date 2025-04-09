import { DomainEvent } from '@shared/events/domain-event.interface';

export class ContaEncerradaEvent implements DomainEvent {
    name = 'conta.encerrada';
    occurredAt = new Date();

    constructor(
        public payload: {
            id: string;
            cpf: string;
            encerradaEm: Date;
        },
    ) { }
}
