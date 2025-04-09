import { DomainEvent } from '@shared/events/domain-event.interface';

export class ContaCriadaEvent implements DomainEvent {
    name = 'conta_criada';
    occurredAt = new Date();

    constructor(
        public readonly payload: {
            id: string;
            cpf: string;
            numero: string;
            agencia: string;
            saldo: number;
            criadaEm: Date;
        },
    ) { }
}
