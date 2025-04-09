import { DomainEvent } from '@shared/events/domain-event.interface';

export class ContaAtivadaEvent implements DomainEvent {
    name = 'conta.ativada';
    occurredAt = new Date();

    constructor(
        public payload: {
            id: string;
            cpf: string;            
        },
    ) { }
}
