import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';

import { ContaOrmEntity } from './infrastructure/database/conta.orm-entity';
import { TypeOrmContaRepository } from './infrastructure/database/typeorm-conta.repository';

import { ContaController } from './presentation/controllers/conta.controller';
import { CriarContaUseCase } from './application/use-cases/criar-conta.use-case';
import { AtualizarContaUseCase } from './application/use-cases/atualizar-conta.use-case';

import { ICONTA_REPOSITORY } from './application/interfaces/tokens';

import { HttpModule } from '@nestjs/axios';
import { PortadorHttpService } from './infrastructure/http/portador-http.service';
import { RabbitMqContaConsumer } from './infrastructure/messaging/rabbitmq-conta-consumer';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './presentation/controllers/health.controller';
import { RabbitmqHealthService } from './infrastructure/health/rabbitmq.health';
import { PortadorHealthService } from './infrastructure/health/portador-http.health';
import { BuscarSaldoUseCase } from './application/use-cases/buscar-saldo.use-case';
import { BuscarContaPorCpfUseCase } from './application/use-cases/buscar-conta.use-case';
import { BloquearContaUseCase } from './application/use-cases/bloquear-conta.use-case';
import { DesbloquearContaUseCase } from './application/use-cases/desbloquear-conta.use-case';
import { EncerrarContaUseCase } from './application/use-cases/encerrar-conta.use-case';
import { ValidarOperacaoContaUseCase } from './application/use-cases/validar-operacao.use-case';
import { AtivarContaUseCase } from './application/use-cases/ativar-conta.use-case';

@Module({
  imports: [
    TypeOrmModule.forFeature([ContaOrmEntity]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'conta_db',
      entities: [ContaOrmEntity],
      synchronize: true,
    }),
    RabbitMQModule.forRoot({
      exchanges: [
        {
          name: 'conta.exchange',
          type: 'topic',
        },
        {
          name: 'conta.dlq',
          type: 'topic',
        },
        {
          name: 'transacao.exchange',
          type: 'topic',
        },
      ],
      uri: 'amqp://admin:admin@localhost:5672',
      connectionInitOptions: { wait: true },
    }),

    HttpModule,
    TerminusModule,
  ],
  controllers: [ContaController, HealthController],
  providers: [
    CriarContaUseCase,
    AtualizarContaUseCase,
    {
      provide: ICONTA_REPOSITORY,
      useClass: TypeOrmContaRepository,
    },
    PortadorHttpService,
    RabbitMqContaConsumer,
    RabbitmqHealthService,
    PortadorHealthService,
    BuscarSaldoUseCase,
    BuscarContaPorCpfUseCase,
    BloquearContaUseCase,
    DesbloquearContaUseCase,
    EncerrarContaUseCase,
    AtivarContaUseCase,
    ValidarOperacaoContaUseCase,
  ],
})
export class ContaModule { }
