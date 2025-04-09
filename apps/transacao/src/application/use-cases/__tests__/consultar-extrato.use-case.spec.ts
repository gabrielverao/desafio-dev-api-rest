import { ConsultarExtratoUseCase } from '../consultar-extrato.use-case';
import { InternalServerErrorException } from '@nestjs/common';
import { TransacaoResponseDto } from '../../../presentation/dtos/transacao-response.dto';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockExtratoModel = () => ({
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn(),
});

describe('ConsultarExtratoUseCase', () => {
    let useCase: ConsultarExtratoUseCase;
    let extratoModel: any;

    beforeEach(() => {
        extratoModel = mockExtratoModel();
        useCase = new ConsultarExtratoUseCase(extratoModel);
    });

    it('deve retornar extrato com sucesso ordenado por data', async () => {
        const dados = [
            {
                id: 't1',
                cpf: '12345678900',
                valor: 100,
                tipo: 'deposito',
                realizadaEm: new Date('2024-01-01T12:00:00.000Z'),
            },
            {
                id: 't2',
                cpf: '12345678900',
                valor: 200,
                tipo: 'saque',
                realizadaEm: new Date('2024-01-02T15:30:00.000Z'),
            },
        ];

        extratoModel.lean.mockResolvedValue(dados);

        const resultado = await useCase.executar('12345678900', new Date('2024-01-01'), new Date('2024-01-03'));

        expect(resultado).toBeInstanceOf(Array);
        expect(resultado.length).toBe(2);
        expect(resultado[0]).toBeInstanceOf(TransacaoResponseDto);
        expect(resultado[0].cpf).toBe('12345678900');
    });

    it('deve lançar InternalServerErrorException se ocorrer erro', async () => {
        extratoModel.lean.mockRejectedValue(new Error('Mongo crash'));

        await expect(
            useCase.executar('12345678900', new Date(), new Date()),
        ).rejects.toThrow(InternalServerErrorException);
    });
});
