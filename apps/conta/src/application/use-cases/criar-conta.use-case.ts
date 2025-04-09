import {
    Inject,
    Injectable,
    ConflictException,
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { Conta } from '../../domain/entities/conta.entity';
import { DomainException } from '@shared/domain/domain.exception';

import { IContaRepository } from '../interfaces/conta.repository';
import { ICONTA_REPOSITORY } from '../interfaces/tokens';
import { ContaCriadaEvent } from '../events/conta-criada.event';

import { PortadorHttpService } from '../../infrastructure/http/portador-http.service';
import { Cpf } from '@shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';

@Injectable()
export class CriarContaUseCase {
    private readonly logger = createLogger('CriarContaUseCase');

    constructor(
        @Inject(ICONTA_REPOSITORY) private readonly repo: IContaRepository,
        private readonly portadorHttp: PortadorHttpService,
    ) { }

    async executar(cpfTexto: string): Promise<Conta> {
        this.logger.info('Iniciando criação de conta', { cpfTexto });

        try {
            const cpf = new Cpf(cpfTexto);

            const existente = await this.repo.buscarPorCpf(cpf.raw);
            if (existente) {
                this.logger.warn('Conta já existente para este CPF', { cpf: cpf.raw });
                throw new ConflictException('Já existe uma conta para este CPF');
            }

            try {
                await this.portadorHttp.verificarCpfExiste(cpf.raw);
                this.logger.info('CPF verificado com sucesso no portador');
            } catch (error) {
                this.logger.error('Erro ao verificar CPF no serviço de portador', error);
                throw new BadRequestException('CPF não encontrado como portador');
            }

            const conta = Conta.criar(cpf.raw);
            await this.repo.salvar(conta);
            this.logger.info('Conta salva com sucesso', { id: conta.id });

            var event = new ContaCriadaEvent({
                id: conta.id,
                cpf: conta.cpf,
                numero: conta.numero,
                agencia: conta.agencia,
                saldo: conta.saldo,
                criadaEm: conta.criadaEm,
            }); // Lança evento

            this.logger.info('Evento conta.criada publicado com sucesso', { id: conta.id });

            return conta;
        } catch (error) {
            this.logger.error('Erro ao criar conta', error);

            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            if (error instanceof DomainException) {
                throw new BadRequestException(error.message);
            }

            throw new InternalServerErrorException('Erro inesperado ao criar conta');
        }

    }
}
