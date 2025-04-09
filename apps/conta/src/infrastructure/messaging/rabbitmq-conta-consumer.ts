import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';

import { CriarContaUseCase } from '../../application/use-cases/criar-conta.use-case';
import { PortadorCriadoPayload } from '../../application/events/payloads/portador-criado.payload';
import { TransacaoCriadaPayload } from '../../application/events/payloads/transacao-criada.payload';
import { AtualizarContaUseCase } from '../../application/use-cases/atualizar-conta.use-case';

@Injectable()
export class RabbitMqContaConsumer {
  private readonly logger = createLogger('RabbitMqContaConsumer');

  constructor(
    private readonly criarContaUseCase: CriarContaUseCase,
    private readonly atualizarContaUseCase: AtualizarContaUseCase
  ) {}

  @RabbitSubscribe({
    exchange: 'portador.exchange',
    routingKey: 'portador.criado',
    queue: 'conta.portador-criado',
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'conta.dlq',
        'x-dead-letter-routing-key': 'conta.dlq.criado',
      },
    },
  })
  async handlePortadorCriado(payload: PortadorCriadoPayload) {
    this.logger.info('Evento portador.criado recebido', payload);

    const MAX_ATTEMPTS = 5;
    const RETRY_DELAY_MS = 5000;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const cpf = new Cpf(payload.cpf);
        await this.criarContaUseCase.executar(cpf.raw);

        this.logger.info('Conta criada com sucesso para o CPF', { cpf: cpf.raw });
        return;
      } catch (error) {
        this.logger.error(`Erro ao criar conta (tentativa ${attempt}/${MAX_ATTEMPTS})`, error);

        if (attempt === MAX_ATTEMPTS) {
          this.logger.error('Máximo de tentativas alcançado. Enviando para DLQ.');
          throw error;
        }

        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      }
    }
  }

  @RabbitSubscribe({
    exchange: 'transacao.exchange',
    routingKey: 'transacao.criada',
    queue: 'conta.transacao-criada',
    queueOptions: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'conta.dlq',
        'x-dead-letter-routing-key': 'conta.dlq.transacao',
      },
    },
  })
  async handleTransacaoCriada(payload: TransacaoCriadaPayload) {
    this.logger.info('Evento transacao.criada recebido', payload);

    const MAX_ATTEMPTS = 5;
    const RETRY_DELAY_MS = 5000;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const cpf = new Cpf(payload.cpf);

        await this.atualizarContaUseCase.executar({
          cpf: cpf.raw,
          tipo: payload.tipo,
          valor: payload.valor,
        });

        this.logger.info('Saldo atualizado com sucesso', { cpf: cpf.raw });
        return;
      } catch (error) {
        this.logger.error(`Erro ao atualizar saldo (tentativa ${attempt}/${MAX_ATTEMPTS})`, error);

        if (attempt === MAX_ATTEMPTS) {
          this.logger.error('Máximo de tentativas alcançado. Enviando para DLQ.');
          throw error;
        }

        await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
      }
    }
  }
}
