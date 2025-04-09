import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

@Schema({ collection: 'extratos' })
export class Extrato {
    @Prop({ required: true })
    id: string;

    @Prop({ required: true })
    cpf: string;

    @Prop({ required: true })
    valor: number;

    @Prop({ required: true, enum: TipoOperacao })
    tipo: TipoOperacao;

    @Prop({ required: true })
    realizadaEm: Date;

    @Prop({ required: true })
    occurredAt: Date;
}

export type ExtratoDocument = Extrato & Document;
export const ExtratoSchema = SchemaFactory.createForClass(Extrato);
