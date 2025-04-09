import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';
import { IContaRepository } from '../interfaces/conta.repository';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { DomainException } from '@shared/domain/domain.exception';
import { ValidarOperacaoDto } from '../../presentation/dtos/validar-operacao.dto';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

@Injectable()
export class ValidarOperacaoContaUseCase {
    private readonly logger = createLogger('ValidarOperacaoContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY)
        private readonly contaRepository: IContaRepository,
    ) { }

    async executar(dto: ValidarOperacaoDto, requestCpf: string): Promise<void> {
        this.logger.info('Validando operação para CPF', { cpf: requestCpf });

        try {
            const cpf = new Cpf(requestCpf);

            const conta = await this.contaRepository.buscarPorCpf(cpf.raw);
            if (!conta) {
                throw new NotFoundException('Conta não encontrada');
            }

            const totalSacadoHoje = dto.tipo === TipoOperacao.SAQUE ? dto.totalSacadoHoje ?? 0 : 0;

            conta.validarOperacao(dto.tipo, dto.valor, totalSacadoHoje);

            this.logger.info('Operação validada com sucesso', {
                tipo: dto.tipo,
                valor: dto.valor,
            });
        } catch (error) {
            this.logger.error('Erro ao validar operação da conta', error);

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw error;
        }
    }
}
