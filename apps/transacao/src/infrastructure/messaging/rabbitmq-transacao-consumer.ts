import { Injectable } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { createLogger } from '@shared/logger/logger.factory';
import { ExtratoProjectionService } from '../projection/extrato-projection.service';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

@Injectable()
export class RabbitMqTransacaoConsumer {
    private readonly logger = createLogger('RabbitMqTransacaoConsumer');

    constructor(
        private readonly extratoProjectionService: ExtratoProjectionService,
    ) { }

    @RabbitSubscribe({
        exchange: 'transacao.exchange',
        routingKey: 'transacao.criada',
        queue: 'transacao.projection.extrato-criado',
        queueOptions: {
            durable: true,
            arguments: {
                'x-dead-letter-exchange': 'transacao.dlq',
                'x-dead-letter-routing-key': 'transacao.dlq.extrato',
            },
        },
    })
    async handleTransacaoCriada(payload: {
        id: string;
        cpf: string;
        valor: number;
        tipo: TipoOperacao;
        realizadaEm: Date;
        occurredAt: Date;
    }) {
        this.logger.info('Evento transacao.criada recebido para projeção', payload);

        const MAX_ATTEMPTS = 5;
        const RETRY_DELAY_MS = 5000;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                await this.extratoProjectionService.salvar(payload);

                this.logger.info('Transação salva no MongoDB com sucesso', { id: payload.id });
                return;
            } catch (error) {
                this.logger.error(`Erro ao salvar extrato (tentativa ${attempt}/${MAX_ATTEMPTS})`, error);

                if (attempt === MAX_ATTEMPTS) {
                    this.logger.error('Máximo de tentativas alcançado. Enviando para DLQ.', {
                        payload,
                    });
                    throw error;
                }

                await new Promise(res => setTimeout(res, RETRY_DELAY_MS));
            }
        }
    }
}
