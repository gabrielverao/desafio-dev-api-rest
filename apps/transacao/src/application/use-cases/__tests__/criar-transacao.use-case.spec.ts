import { CriarTransacaoUseCase } from '../criar-transacao.use-case';
import { ITransacaoRepository } from '../../interfaces/transacao.repository';
import { ContaHttpService } from '../../../infrastructure/http/conta-http.service';
import { EventPublisher } from '@shared/events/event-publisher.interface';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import { BadRequestException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockTransacaoRepository = () => ({
    salvar: jest.fn(),
    calcularTotalSacadoHoje: jest.fn(),
    buscarPorCpf: jest.fn(),
    buscarPorCpfEPeriodo: jest.fn(),
});

const mockContaHttpService = () => ({
    validarOperacao: jest.fn(),
});

const mockEventPublisher = () => ({
    publish: jest.fn(),
});

describe('CriarTransacaoUseCase', () => {
    let useCase: CriarTransacaoUseCase;
    let repo: jest.Mocked<ITransacaoRepository>;
    let contaHttp: jest.Mocked<ContaHttpService>;
    let publisher: jest.Mocked<EventPublisher>;

    beforeEach(() => {
        repo = mockTransacaoRepository() as jest.Mocked<ITransacaoRepository>;
        contaHttp = mockContaHttpService() as Partial<ContaHttpService> as jest.Mocked<ContaHttpService>;
        publisher = mockEventPublisher() as jest.Mocked<EventPublisher>;

        useCase = new CriarTransacaoUseCase(repo, contaHttp, publisher);
    });

    it('deve criar uma transação de depósito com sucesso', async () => {
        repo.calcularTotalSacadoHoje.mockResolvedValue(0);
        contaHttp.validarOperacao.mockResolvedValue(undefined);
        repo.salvar.mockResolvedValue(undefined);
        publisher.publish.mockResolvedValue(undefined);

        await expect(
            useCase.executar({
                cpf: '12345678900',
                tipo: TipoOperacao.DEPOSITO,
                valor: 500,
            }),
        ).resolves.toBeUndefined();

        expect(repo.salvar).toHaveBeenCalled();
        expect(publisher.publish).toHaveBeenCalled();
    });

    it('deve criar uma transação de saque com sucesso', async () => {
        repo.calcularTotalSacadoHoje.mockResolvedValue(300);
        contaHttp.validarOperacao.mockResolvedValue(undefined);
        repo.salvar.mockResolvedValue(undefined);
        publisher.publish.mockResolvedValue(undefined);

        await expect(
            useCase.executar({
                cpf: '12345678900',
                tipo: TipoOperacao.SAQUE,
                valor: 100,
            }),
        ).resolves.toBeUndefined();

        expect(repo.calcularTotalSacadoHoje).toHaveBeenCalledWith('12345678900');
    });

    it('deve lançar BadRequestException se valor for inválido', async () => {
        await expect(
            useCase.executar({
                cpf: '12345678900',
                tipo: TipoOperacao.DEPOSITO,
                valor: 0,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se validarOperacao falhar', async () => {
        repo.calcularTotalSacadoHoje.mockResolvedValue(0);
        contaHttp.validarOperacao.mockRejectedValue(new Error('Rejeitado'));

        await expect(
            useCase.executar({
                cpf: '12345678900',
                tipo: TipoOperacao.SAQUE,
                valor: 100,
            }),
        ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se salvar falhar', async () => {
        repo.calcularTotalSacadoHoje.mockResolvedValue(0);
        contaHttp.validarOperacao.mockResolvedValue(undefined);
        repo.salvar.mockRejectedValue(new Error('Falha ao salvar'));

        await expect(
            useCase.executar({
                cpf: '12345678900',
                tipo: TipoOperacao.DEPOSITO,
                valor: 100,
            }),
        ).rejects.toThrow(BadRequestException);
    });
});
