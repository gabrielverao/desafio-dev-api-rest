import { BloquearContaUseCase } from '../bloquear-conta.use-case';
import { IContaRepository } from '../../interfaces/conta.repository';
import { Conta } from '../../../domain/entities/conta.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockContaRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn(),
});

describe('BloquearContaUseCase', () => {
    let useCase: BloquearContaUseCase;
    let repo: jest.Mocked<IContaRepository>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        useCase = new BloquearContaUseCase(repo);
    });

    it('deve bloquear a conta com sucesso', async () => {
        const conta = Conta.criar('12345678900');
        repo.buscarPorCpf.mockResolvedValue(conta);

        await useCase.executar(conta.cpf);

        expect(repo.buscarPorCpf).toHaveBeenCalledWith(conta.cpf);
        expect(conta.bloqueada).toBe(true);
        expect(repo.salvar).toHaveBeenCalledWith(conta);
    });

    it('deve lançar NotFoundException se conta não encontrada', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(useCase.executar('12345678900')).rejects.toThrow(NotFoundException);
        expect(repo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);
        expect(repo.buscarPorCpf).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se conta já estiver bloqueada', async () => {
        const conta = Conta.criar('12345678900');
        conta.bloquear(); // já está bloqueada

        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(useCase.executar(conta.cpf)).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('Falha inesperada'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('Falha inesperada');
    });
});
