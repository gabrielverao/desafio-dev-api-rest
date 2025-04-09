import { Portador } from '../../domain/entities/portador.entity';
import { Cpf } from '../../../../../shared/domain/value-objects/cpf.vo';

export interface IPortadorRepository {
  salvar(portador: Portador): Promise<void>;
  buscarPorCpf(cpf: Cpf): Promise<Portador | null>;
  removerPorCpf(cpf: Cpf): Promise<void>;
}
