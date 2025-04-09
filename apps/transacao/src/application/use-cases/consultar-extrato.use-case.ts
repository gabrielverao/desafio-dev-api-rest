import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createLogger } from '@shared/logger/logger.factory';
import { TransacaoResponseDto } from '../../presentation/dtos/transacao-response.dto';
import { Model } from 'mongoose';
import { Extrato, ExtratoDocument } from '../../infrastructure/projection/extrato.schema';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ConsultarExtratoUseCase {
    private readonly logger = createLogger('ConsultarExtratoUseCase');

    constructor(
        @InjectModel(Extrato.name) private readonly extratoModel: Model<ExtratoDocument>,
    ) { }

    async executar(cpf: string, inicio: Date, fim: Date): Promise<TransacaoResponseDto[]> {
        this.logger.info('Consultando extrato no MongoDB', { cpf, inicio, fim });

        try {
            const resultados = await this.extratoModel.find({
                cpf,
                realizadaEm: {
                    $gte: inicio,
                    $lte: fim,
                },
            }).sort({ realizadaEm: -1 }).lean();

            this.logger.info('Extrato recuperado com sucesso', {
                total: resultados.length,
                cpf,
            });

            return plainToInstance(TransacaoResponseDto, resultados, {
                excludeExtraneousValues: true,
            });
        } catch (error) {
            this.logger.error('Erro ao consultar extrato no MongoDB', error);
            throw new InternalServerErrorException('Erro ao consultar extrato');
        }
    }
}
