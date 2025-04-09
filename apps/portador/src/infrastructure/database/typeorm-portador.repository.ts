import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { PortadorOrmEntity } from './portador.orm-entity';
import { IPortadorRepository } from '../../application/interfaces/portador.repository';
import { Portador } from '../../domain/entities/portador.entity';
import { Cpf } from '../../../../../shared/domain/value-objects/cpf.vo';
import { createLogger } from '@shared/logger/logger.factory';

@Injectable()
export class TypeOrmPortadorRepository implements IPortadorRepository {
  private readonly logger = createLogger('TypeOrmPortadorRepository');

  constructor(
    @InjectRepository(PortadorOrmEntity)
    private readonly repo: Repository<PortadorOrmEntity>,
  ) { }

  async salvar(portador: Portador): Promise<void> {
    try {
      const entidade = this.repo.create({
        id: portador.id,
        nomeCompleto: portador.nomeCompleto,
        cpf: portador.cpf,
        criadoEm: portador.criadoEm,
      });

      await this.repo.save(entidade);
      this.logger.info('Portador salvo no banco', { id: portador.id });
    } catch (error) {
      this.logger.error('Erro ao salvar portador', error);
      throw error;
    }
  }

  async buscarPorCpf(cpf: Cpf): Promise<Portador | null> {
    try {
      const resultado = await this.repo.findOneBy({ cpf: cpf.raw });

      if (!resultado) {
        this.logger.warn('Portador não encontrado no banco', { cpf: cpf.raw });
        return null;
      }

      this.logger.info('Portador encontrado no banco', { id: resultado.id });

      return new Portador(
        resultado.id,
        resultado.nomeCompleto,
        resultado.cpf,
        resultado.criadoEm,
      );
    } catch (error) {
      this.logger.error('Erro ao buscar portador por CPF', error);
      throw error;
    }
  }

  async removerPorCpf(cpf: Cpf): Promise<void> {
    try {
      await this.repo.softDelete({ cpf: cpf.raw });
      this.logger.info('Portador removido (soft delete)', { cpf: cpf.raw });
    } catch (error) {
      this.logger.error('Erro ao remover portador', error);
      throw error;
    }
  }
}
