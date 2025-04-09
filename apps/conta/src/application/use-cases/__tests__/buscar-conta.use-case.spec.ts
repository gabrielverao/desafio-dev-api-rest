import { BuscarContaPorCpfUseCase } from '../buscar-conta.use-case';
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

describe('BuscarContaPorCpfUseCase', () => {
    let useCase: BuscarContaPorCpfUseCase;
    let repo: jest.Mocked<IContaRepository>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        useCase = new BuscarContaPorCpfUseCase(repo);
    });

    it('deve retornar DTO se conta for encontrada', async () => {
        const conta = Conta.criar('12345678900');
        repo.buscarPorCpf.mockResolvedValue(conta);

        const result = await useCase.executar(conta.cpf);

        expect(result).toMatchObject({
            id: conta.id,
            cpf: conta.cpf,
            numero: conta.numero,
            agencia: conta.agencia,
            saldo: conta.saldo,
        });
    });

    it('deve lançar NotFoundException se conta não for encontrada', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(useCase.executar('12345678900')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);
        expect(repo.buscarPorCpf).not.toHaveBeenCalled();
    });

    it('deve propagar erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('Erro interno'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('Erro interno');
    });
});
