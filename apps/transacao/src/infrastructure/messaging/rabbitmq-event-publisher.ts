import { Injectable } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { EventPublisher } from '@shared/events/event-publisher.interface';
import { DomainEvent } from '@shared/events/domain-event.interface';

@Injectable()
export class RabbitMqEventPublisher implements EventPublisher {
  constructor(private readonly amqp: AmqpConnection) {}

  async publish(event: DomainEvent): Promise<void> {
    await this.amqp.publish('transacao.exchange', event.name, {
      ...event.payload,
      occurredAt: event.occurredAt.toISOString(),
    });
  }
}
