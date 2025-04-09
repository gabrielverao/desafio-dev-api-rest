export interface DomainEvent {
    name: string;
    payload: any;
    occurredAt: Date;
}
