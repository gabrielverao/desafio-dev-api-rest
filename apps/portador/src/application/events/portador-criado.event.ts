import { DomainEvent } from '@shared/events/domain-event.interface';

export class PortadorCriadoEvent implements DomainEvent {
    name = 'portador.criado';
    occurredAt = new Date();

    constructor(public payload: {
        id: string;
        nomeCompleto: string;
        cpf: string;
        criadoEm: Date;
    }) { }
}
