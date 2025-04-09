import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { IContaRepository } from '../interfaces/conta.repository';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { DomainException } from '@shared/domain/domain.exception';
import { createLogger } from '@shared/logger/logger.factory';
import { ContaDesbloqueadaEvent } from '../events/conta-desbloqueada.event';

@Injectable()
export class DesbloquearContaUseCase {
    private readonly logger = createLogger('DesbloquearContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository,
    ) { }

    async executar(cpfTexto: string): Promise<void> {
        this.logger.info('Iniciando desbloqueio da conta', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);
            const conta = await this.repo.buscarPorCpf(cpf.raw);

            if (!conta) {
                throw new NotFoundException('Conta não encontrada');
            }

            conta.desbloquear();
            await this.repo.salvar(conta);
            this.logger.info('Conta desbloqueada com sucesso', { id: conta.id });

            var event = new ContaDesbloqueadaEvent({
                id: conta.id,
                cpf: conta.cpf,
                desbloqueadaEm: new Date(),
            }); // Lança evento

            this.logger.info('Evento conta.desbloqueada publicado', {
                id: conta.id,
            });
        } catch (error) {
            this.logger.error('Erro ao desbloquear conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
