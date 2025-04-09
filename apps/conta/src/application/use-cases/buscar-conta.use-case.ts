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
import { plainToInstance } from 'class-transformer';
import { ContaResponseDto } from '../../presentation/dtos/conta-response.dto';
import { createLogger } from '@shared/logger/logger.factory';

@Injectable()
export class BuscarContaPorCpfUseCase {
    private readonly logger = createLogger('BuscarContaPorCpfUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository,
    ) { }

    async executar(cpfTexto: string): Promise<ContaResponseDto> {
        this.logger.info('Iniciando busca de conta por CPF', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);
            const conta = await this.repo.buscarPorCpf(cpf.raw);

            if (!conta) {
                this.logger.warn('Conta não encontrada', { cpf: cpf.raw });
                throw new NotFoundException('Conta não encontrada');
            }

            return plainToInstance(ContaResponseDto, conta, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            this.logger.error('Erro ao buscar conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
