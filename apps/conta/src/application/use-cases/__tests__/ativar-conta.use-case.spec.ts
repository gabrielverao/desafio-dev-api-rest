import { AtivarContaUseCase } from '../ativar-conta.use-case';
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

describe('AtivarContaUseCase', () => {
    let useCase: AtivarContaUseCase;
    let repo: jest.Mocked<IContaRepository>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        useCase = new AtivarContaUseCase(repo);
    });

    it('deve ativar uma conta com sucesso', async () => {
        const conta = Conta.criar('12345678900');
        conta.ativa = false;

        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(useCase.executar('12345678900')).resolves.toBeUndefined();

        expect(repo.buscarPorCpf).toHaveBeenCalledWith('12345678900');
        expect(repo.salvar).toHaveBeenCalledWith(expect.objectContaining({ ativa: true }));
    });

    it('deve lançar NotFoundException se conta não for encontrada', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(useCase.executar('12345678900')).rejects.toThrow(NotFoundException);
        expect(repo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);
        expect(repo.buscarPorCpf).not.toHaveBeenCalled();
        expect(repo.salvar).not.toHaveBeenCalled();
    });

    it('deve propagar erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('erro desconhecido'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('erro desconhecido');
    });
});
