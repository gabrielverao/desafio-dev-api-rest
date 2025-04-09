import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Extrato, ExtratoDocument } from './extrato.schema';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import { createLogger } from '@shared/logger/logger.factory';

@Injectable()
export class ExtratoProjectionService {
    private readonly logger = createLogger('ExtratoProjectionService');

    constructor(
        @InjectModel(Extrato.name) private readonly extratoModel: Model<ExtratoDocument>,
    ) { }

    async salvar(payload: {
        id: string;
        cpf: string;
        valor: number;
        tipo: TipoOperacao;
        realizadaEm: Date;
        occurredAt: Date;
    }): Promise<void> {
        this.logger.info('Gravando transação no extrato', payload);

        await this.extratoModel.create({
            ...payload,
        });

        this.logger.info('Transação salva no MongoDB com sucesso', { id: payload.id });
    }
}
