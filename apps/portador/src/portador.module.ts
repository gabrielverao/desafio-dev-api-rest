import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { PortadorController } from './presentation/controllers/portador.controller';
import { CriarPortadorUseCase } from './application/use-cases/criar-portador.use-case';
import { RemoverPortadorUseCase } from './application/use-cases/remover-portador.use-case';
import { BuscarPortadorPorCpfUseCase } from './application/use-cases/buscar-portador.use-case';

import { EVENT_PUBLISHER, IPORTADOR_REPOSITORY } from './application/interfaces/tokens';

import { TypeOrmPortadorRepository } from './infrastructure/database/typeorm-portador.repository';
import { PortadorOrmEntity } from './infrastructure/database/portador.orm-entity';

import { RabbitMqEventPublisher } from './infrastructure/messaging/rabbitmq-event-publisher';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './presentation/controllers/health.controller';
import { RabbitmqHealthService } from './infrastructure/health/rabbitmq.health';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortadorOrmEntity]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'portador_db',
      entities: [PortadorOrmEntity],
      synchronize: true,
    }),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'portador.exchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://admin:admin@localhost:5672',
      connectionInitOptions: { wait: true },
    }),
    TerminusModule,
  ],
  controllers: [PortadorController, HealthController],
  providers: [
    CriarPortadorUseCase,
    RemoverPortadorUseCase,
    BuscarPortadorPorCpfUseCase,
    {
      provide: IPORTADOR_REPOSITORY,
      useClass: TypeOrmPortadorRepository,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: RabbitMqEventPublisher,
    },
    RabbitmqHealthService,
  ],
})
export class PortadorModule { }
