import { DesbloquearContaUseCase } from '../desbloquear-conta.use-case';
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

describe('DesbloquearContaUseCase', () => {
    let useCase: DesbloquearContaUseCase;
    let repo: jest.Mocked<IContaRepository>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        useCase = new DesbloquearContaUseCase(repo);
    });

    it('deve desbloquear uma conta com sucesso', async () => {
        const conta = Conta.criar('12345678900');
        conta.bloquear(); // garantir que está bloqueada

        repo.buscarPorCpf.mockResolvedValue(conta);

        await useCase.executar(conta.cpf);

        expect(conta.bloqueada).toBe(false);
        expect(repo.salvar).toHaveBeenCalledWith(conta);
    });

    it('deve lançar NotFoundException se conta não for encontrada', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(useCase.executar('12345678900')).rejects.toThrow(NotFoundException);
        expect(repo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);
        expect(repo.buscarPorCpf).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se conta não estiver bloqueada', async () => {
        const conta = Conta.criar('12345678900'); // já desbloqueada

        repo.buscarPorCpf.mockResolvedValue(conta);

        await expect(useCase.executar(conta.cpf)).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('Erro desconhecido'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('Erro desconhecido');
    });
});
