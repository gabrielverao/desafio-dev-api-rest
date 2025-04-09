import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ValidarOperacaoDto } from 'apps/conta/src/presentation/dtos/validar-operacao.dto';
import { createLogger } from '@shared/logger/logger.factory';

@Injectable()
export class ContaHttpService {
    private readonly logger = createLogger('ContaHttpService');

    constructor(private readonly http: HttpService) { }

    async validarOperacao(cpf: string, dto: ValidarOperacaoDto): Promise<void> {
        this.logger.info('Validando operação no serviço de Conta', { cpf, ...dto });

        try {
            await lastValueFrom(
                this.http.post(`http://localhost:3001/contas/${cpf}/validar-operacao`, dto),
            );

            this.logger.info('Operação válida no serviço de Conta', { cpf });
        } catch (error) {
            const status = error.response?.status;
            const msg = error.response?.data?.message;

            this.logger.warn('Erro na validação da operação', {
                cpf,
                status,
                message: msg,
            });

            if (status === 404) {
                throw new NotFoundException('Conta não encontrada');
            }

            if (status === 400 || status === 409) {
                throw new BadRequestException(msg || 'Operação inválida');
            }

            throw new Error('Erro ao validar operação no serviço de conta');
        }
    }
}
