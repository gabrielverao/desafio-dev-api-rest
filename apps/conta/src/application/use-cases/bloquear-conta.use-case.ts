import {
    Inject,
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';
import { IContaRepository } from '../interfaces/conta.repository';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { DomainException } from '@shared/domain/domain.exception';
import { ContaBloqueadaEvent } from '../events/conta-bloqueada.event';

@Injectable()
export class BloquearContaUseCase {
    private readonly logger = createLogger('BloquearContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository
    ) { }

    async executar(cpfTexto: string): Promise<void> {
        this.logger.info('Iniciando bloqueio da conta', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);

            const conta = await this.repo.buscarPorCpf(cpf.raw);
            if (!conta) {
                throw new NotFoundException('Conta não encontrada');
            }

            conta.bloquear();
            await this.repo.salvar(conta);
            this.logger.info('Conta bloqueada com sucesso', { id: conta.id });

            var event = new ContaBloqueadaEvent({
                id: conta.id,
                cpf: conta.cpf,
                bloqueadaEm: new Date(),
            }); // Lança o evento

            this.logger.info('Evento conta.bloqueada publicado', { id: conta.id });
        } catch (error) {
            this.logger.error('Erro ao bloquear conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
