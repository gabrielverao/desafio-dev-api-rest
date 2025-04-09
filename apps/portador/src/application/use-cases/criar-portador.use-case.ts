import {
    Inject,
    Injectable,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { EVENT_PUBLISHER, IPORTADOR_REPOSITORY } from '../interfaces/tokens';
import { IPortadorRepository } from '../interfaces/portador.repository';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { Portador } from '../../domain/entities/portador.entity';
import { EventPublisher } from '@shared/events/event-publisher.interface';
import { PortadorCriadoEvent } from '../events/portador-criado.event';
import { createLogger } from '@shared/logger/logger.factory';
import { DomainException } from '@shared/domain/domain.exception';

@Injectable()
export class CriarPortadorUseCase {
    private readonly logger = createLogger('CriarPortadorUseCase');

    constructor(
        @Inject(IPORTADOR_REPOSITORY) private readonly repo: IPortadorRepository,
        @Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher,
    ) { }

    async executar(nomeCompleto: string, cpfTexto: string): Promise<void> {
        this.logger.info('Iniciando criação de portador', { nomeCompleto, cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);

            const existente = await this.repo.buscarPorCpf(cpf);
            if (existente) {
                this.logger.warn('CPF já cadastrado', { cpf: cpfTexto });
                throw new ConflictException('CPF já cadastrado');
            }

            const portador = Portador.criar(nomeCompleto, cpf.raw);

            await this.repo.salvar(portador);

            this.logger.info('Portador salvo no banco de dados', { id: portador.id });

            await this.publisher.publish(
                new PortadorCriadoEvent({
                    id: portador.id,
                    nomeCompleto: portador.nomeCompleto,
                    cpf: portador.cpf,
                    criadoEm: portador.criadoEm,
                }),
            );

            this.logger.info('Evento portador.criado publicado', { id: portador.id });
        } catch (error) {
            this.logger.error('Erro ao criar portador', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
