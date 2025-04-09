import { EncerrarContaUseCase } from '../encerrar-conta.use-case';
import { IContaRepository } from '../../interfaces/conta.repository';
import { Conta } from '../../../domain/entities/conta.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockContaRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn(),
});

describe('EncerrarContaUseCase', () => {
    let useCase: EncerrarContaUseCase;
    let repo: jest.Mocked<IContaRepository>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        useCase = new EncerrarContaUseCase(repo);
    });

    it('deve encerrar uma conta com sucesso', async () => {
        const conta = Conta.criar('12345678900');
        repo.buscarPorCpf.mockResolvedValue(conta);

        await useCase.executar(conta.cpf);

        expect(conta.ativa).toBe(false);
        expect(repo.salvar).toHaveBeenCalledWith(conta);
    });

    it('deve lançar NotFoundException se conta não for encontrada', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(useCase.executar('12345678900')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);
        expect(repo.buscarPorCpf).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se conta tiver saldo', async () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(100); // Conta com saldo não pode encerrar

        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(useCase.executar(conta.cpf)).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('Erro desconhecido'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('Erro desconhecido');
    });
});
