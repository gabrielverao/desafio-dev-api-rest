import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { TransacaoController } from './presentation/controllers/transacao.controller';
import { HealthController } from './presentation/controllers/health.controller';

import { TransacaoOrmEntity } from './infrastructure/database/transacao.orm-entity';
import { TypeOrmTransacaoRepository } from './infrastructure/database/typeorm-transacao.repository';

import { CriarTransacaoUseCase } from './application/use-cases/criar-transacao.use-case';
import { ConsultarExtratoUseCase } from './application/use-cases/consultar-extrato.use-case';

import { ContaHttpService } from './infrastructure/http/conta-http.service';
import { RabbitMqEventPublisher } from './infrastructure/messaging/rabbitmq-event-publisher';
import { RabbitMqTransacaoConsumer } from './infrastructure/messaging/rabbitmq-transacao-consumer';

import { ExtratoProjectionService } from './infrastructure/projection/extrato-projection.service';
import { Extrato, ExtratoSchema } from './infrastructure/projection/extrato.schema';

import { RabbitmqHealthService } from './infrastructure/health/rabbitmq.health';
import { ContaHealthService } from './infrastructure/health/conta-http.health';

import { ITRANSACAO_REPOSITORY, EVENT_PUBLISHER } from './application/interfaces/tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransacaoOrmEntity]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'transacao_db',
      entities: [TransacaoOrmEntity],
      synchronize: true,
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/extrato_db'),
    MongooseModule.forFeature([{ name: Extrato.name, schema: ExtratoSchema }]),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'transacao.exchange',
          type: 'topic',
        },
        {
          name: 'transacao.dlq',
          type: 'topic',
        },
      ],
      uri: 'amqp://admin:admin@localhost:5672',
      connectionInitOptions: { wait: true },
    }),
    HttpModule,
    TerminusModule,
  ],
  controllers: [TransacaoController, HealthController],
  providers: [
    CriarTransacaoUseCase,
    ConsultarExtratoUseCase,
    {
      provide: ITRANSACAO_REPOSITORY,
      useClass: TypeOrmTransacaoRepository,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: RabbitMqEventPublisher,
    },
    ContaHttpService,
    ExtratoProjectionService,
    RabbitMqTransacaoConsumer,
    RabbitmqHealthService,
    ContaHealthService,
  ],
})
export class TransacaoModule {}
