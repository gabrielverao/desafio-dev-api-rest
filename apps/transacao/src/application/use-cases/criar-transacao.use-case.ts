import {
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { createLogger } from '@shared/logger/logger.factory';
import { ITransacaoRepository } from '../interfaces/transacao.repository';
import { ITRANSACAO_REPOSITORY, EVENT_PUBLISHER } from '../interfaces/tokens';
import { ContaHttpService } from '../../infrastructure/http/conta-http.service';
import { TransacaoCriadaEvent } from '../events/transacao-criada.event';
import { Transacao } from '../../domain/entities/transacao.entity';
import { CriarTransacaoDto } from '../../presentation/dtos/criar-transacao.dto';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import { EventPublisher } from '@shared/events/event-publisher.interface';

@Injectable()
export class CriarTransacaoUseCase {
    private readonly logger = createLogger('CriarTransacaoUseCase');

    constructor(
        @Inject(ITRANSACAO_REPOSITORY) private readonly transacaoRepo: ITransacaoRepository,
        private readonly contaHttp: ContaHttpService,
        @Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher,
    ) { }

    async executar(dto: CriarTransacaoDto): Promise<void> {
        this.logger.info('Criando transação', dto);

        try {
            const transacao = Transacao.criar(dto.cpf, dto.valor, dto.tipo);

            const totalSacadoHoje =
                dto.tipo === TipoOperacao.SAQUE
                    ? await this.transacaoRepo.calcularTotalSacadoHoje(dto.cpf)
                    : 0;

            await this.contaHttp.validarOperacao(dto.cpf, {
                tipo: dto.tipo,
                valor: dto.valor,
                totalSacadoHoje,
            });

            await this.transacaoRepo.salvar(transacao);
            this.logger.info('Transação salva com sucesso', { id: transacao.id });

            const event = new TransacaoCriadaEvent({
                id: transacao.id,
                cpf: transacao.cpf,
                valor: transacao.valor,
                tipo: transacao.tipo,
                realizadaEm: transacao.realizadaEm,
            });

            await this.publisher.publish(event);

            this.logger.info('Evento transacao.criada publicado', {
                id: transacao.id,
            });
        } catch (error) {
            this.logger.error('Erro ao criar transação', error);
            throw new BadRequestException(error.message);
        }
    }
}
