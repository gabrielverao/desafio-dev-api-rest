import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { connect } from 'amqplib';

@Injectable()
export class RabbitmqHealthService {
    async check(): Promise<HealthIndicatorResult> {
        try {
            const connection = await connect('amqp://admin:admin@localhost:5672');
            await connection.close();

            return {
                rabbitmq: {
                    status: 'up',
                },
            };
        } catch (error) {
            return {
                rabbitmq: {
                    status: 'down',
                    message: error.message,
                },
            };
        }
    }
}
