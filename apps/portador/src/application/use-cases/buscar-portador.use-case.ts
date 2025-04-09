import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IPortadorRepository } from '../interfaces/portador.repository';
import { IPORTADOR_REPOSITORY } from '../interfaces/tokens';
import { Cpf } from '../../../../../shared/domain/value-objects/cpf.vo';
import { plainToInstance } from 'class-transformer';
import { PortadorResponseDto } from '../../presentation/dtos/portador-response.dto';
import { createLogger } from '@shared/logger/logger.factory';
import { DomainException } from '@shared/domain/domain.exception';

@Injectable()
export class BuscarPortadorPorCpfUseCase {
  private readonly logger = createLogger('BuscarPortadorPorCpfUseCase');

  constructor(
    @Inject(IPORTADOR_REPOSITORY)
    private readonly repo: IPortadorRepository,
  ) { }

  async executar(cpfTexto: string): Promise<PortadorResponseDto> {
    this.logger.info('Iniciando busca de portador por CPF', { cpf: cpfTexto });

    try {
      const cpf = new Cpf(cpfTexto);

      const portador = await this.repo.buscarPorCpf(cpf);

      if (!portador) {
        this.logger.warn('Portador não encontrado', { cpf: cpf.raw });
        throw new NotFoundException('Portador não encontrado');
      }

      this.logger.info('Portador encontrado', { id: portador.id });

      return plainToInstance(PortadorResponseDto, portador, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error('Erro ao buscar portador por CPF', error);

      if (error instanceof DomainException) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }
}
