import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IContaRepository } from '../interfaces/conta.repository';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import { createLogger } from '@shared/logger/logger.factory';
import { DomainException } from '@shared/domain/domain.exception';

@Injectable()
export class AtualizarContaUseCase {
    private readonly logger = createLogger('AtualizarContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly contaRepo: IContaRepository,
    ) { }

    async executar(input: {
        cpf: string;
        tipo: TipoOperacao;
        valor: number;
    }): Promise<void> {
        this.logger.info('Iniciando atualização de saldo', input);

        const conta = await this.contaRepo.buscarPorCpf(input.cpf);
        if (!conta) {
            this.logger.warn('Conta não encontrada', { cpf: input.cpf });
            throw new NotFoundException('Conta não encontrada');
        }

        try {
            if (input.tipo === TipoOperacao.DEPOSITO) {
                conta.depositar(input.valor);
            } else if (input.tipo === TipoOperacao.SAQUE) {
                conta.sacar(input.valor, 0);
            }

            await this.contaRepo.salvar(conta);

            this.logger.info('Conta atualizada com sucesso', { contaId: conta.id });
        } catch (error) {
            this.logger.error('Erro ao atualizar saldo da conta', error);
            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }
}
