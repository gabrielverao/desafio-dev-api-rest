import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

export class TransacaoCriadaPayload {
    id: string;
    cpf: string;
    valor: number;
    tipo: TipoOperacao;
    realizadaEm: Date;
    occurredAt: Date;
}
