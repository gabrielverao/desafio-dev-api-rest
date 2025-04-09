import {
    Inject,
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { IContaRepository } from '../interfaces/conta.repository';
import { DomainException } from '@shared/domain/domain.exception';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';

@Injectable()
export class BuscarSaldoUseCase {
    private readonly logger = createLogger('BuscarSaldoUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository,
    ) { }

    async executar(cpfTexto: string): Promise<number> {
        this.logger.info('Iniciando consulta de saldo', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);
            const conta = await this.repo.buscarPorCpf(cpf.raw);

            if (!conta) {
                this.logger.warn('Conta não encontrada para o CPF', { cpf: cpf.raw });
                throw new NotFoundException('Conta não encontrada');
            }

            this.logger.info('Saldo encontrado com sucesso', { saldo: conta.saldo });
            return conta.saldo;
        } catch (error) {
            this.logger.error('Erro ao buscar saldo da conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
