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
import { ContaAtivadaEvent } from '../events/conta-ativada.event';

@Injectable()
export class AtivarContaUseCase {
    private readonly logger = createLogger('EncerrarContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository,
    ) { }

    async executar(cpfTexto: string): Promise<void> {
        this.logger.info('Iniciando ativação da conta', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);
            const conta = await this.repo.buscarPorCpf(cpf.raw);

            if (!conta) {
                throw new NotFoundException('Conta não encontrada');
            }

            conta.ativar();
            await this.repo.salvar(conta);
            this.logger.info('Conta ativada com sucesso', { id: conta.id });

            var event = new ContaAtivadaEvent({
                id: conta.id,
                cpf: conta.cpf
            }); // Lança evento

            this.logger.info('Evento conta.ativadada publicado', { id: conta.id });
        } catch (error) {
            this.logger.error('Erro ao encerrar conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }

}
