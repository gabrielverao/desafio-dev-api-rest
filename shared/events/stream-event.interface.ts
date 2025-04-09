export interface StreamEvent<T = any> {
    name: string;
    payload: T;
    occurredAt: Date;
}
