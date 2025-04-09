import {
    Inject,
    Injectable,
    BadRequestException,
    NotFoundException
} from '@nestjs/common';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';
import { IContaRepository } from '../interfaces/conta.repository';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { DomainException } from '@shared/domain/domain.exception';
import { ContaEncerradaEvent } from '../events/conta-encerrada.event';

@Injectable()
export class EncerrarContaUseCase {
    private readonly logger = createLogger('EncerrarContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository
    ) { }

    async executar(cpfTexto: string): Promise<void> {
        this.logger.info('Iniciando encerramento da conta', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);
            const conta = await this.repo.buscarPorCpf(cpf.raw);

            if (!conta) {
                throw new NotFoundException('Conta não encontrada');
            }

            conta.encerrar();
            await this.repo.salvar(conta);
            this.logger.info('Conta encerrada com sucesso', { id: conta.id });

            var event = new ContaEncerradaEvent({
                id: conta.id,
                cpf: conta.cpf,
                encerradaEm: new Date(),
            }); // Lança evento

            this.logger.info('Evento conta.encerrada publicado', { id: conta.id });
        } catch (error) {
            this.logger.error('Erro ao encerrar conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }

}
