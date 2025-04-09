import {
    Inject,
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { IPORTADOR_REPOSITORY } from '../interfaces/tokens';
import { IPortadorRepository } from '../interfaces/portador.repository';
import { Cpf } from '../../../../../shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';
import { DomainException } from '@shared/domain/domain.exception';

@Injectable()
export class RemoverPortadorUseCase {
    private readonly logger = createLogger('RemoverPortadorUseCase');

    constructor(
        @Inject(IPORTADOR_REPOSITORY)
        private readonly repo: IPortadorRepository,
    ) { }

    async executar(cpfTexto: string): Promise<void> {
        this.logger.info('Iniciando remoção de portador', { cpf: cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);

            await this.repo.removerPorCpf(cpf);

            this.logger.info('Portador removido com sucesso', { cpf: cpf.raw });
        } catch (error) {
            this.logger.error('Erro ao remover portador', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
