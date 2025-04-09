import { ValidarOperacaoContaUseCase } from '../validar-operacao.use-case';
import { IContaRepository } from '../../interfaces/conta.repository';
import { Conta } from '../../../domain/entities/conta.entity';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockContaRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn()
});

describe('ValidarOperacaoContaUseCase', () => {
    let useCase: ValidarOperacaoContaUseCase;
    let repo: jest.Mocked<IContaRepository>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        useCase = new ValidarOperacaoContaUseCase(repo);
    });

    it('deve validar operação de depósito com sucesso', async () => {
        const conta = Conta.criar('12345678900');
        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(
            useCase.executar(
                { tipo: TipoOperacao.DEPOSITO, valor: 100 },
                conta.cpf,
            ),
        ).resolves.toBeUndefined();
    });

    it('deve validar operação de saque com sucesso (sem exceder limite)', async () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(1000);
        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(
            useCase.executar(
                { tipo: TipoOperacao.SAQUE, valor: 500, totalSacadoHoje: 0 },
                conta.cpf,
            ),
        ).resolves.toBeUndefined();
    });

    it('deve lançar NotFoundException se conta não for encontrada', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(
            useCase.executar(
                { tipo: TipoOperacao.SAQUE, valor: 100 },
                '12345678900',
            ),
        ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se operação for inválida (ex.: saldo insuficiente)', async () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(50);
        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(
            useCase.executar(
                { tipo: TipoOperacao.SAQUE, valor: 200, totalSacadoHoje: 0 },
                conta.cpf,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(
            useCase.executar({ tipo: TipoOperacao.DEPOSITO, valor: 100 }, ''),
        ).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('Erro inesperado'));

        await expect(
            useCase.executar({ tipo: TipoOperacao.DEPOSITO, valor: 100 }, '12345678900'),
        ).rejects.toThrow('Erro inesperado');
    });
});
