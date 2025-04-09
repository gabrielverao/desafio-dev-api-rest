import { RemoverPortadorUseCase } from '../remover-portador.use-case';
import { IPortadorRepository } from '../../interfaces/portador.repository';
import { BadRequestException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockPortadorRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn(),
    removerPorCpf: jest.fn()
});

describe('RemoverPortadorUseCase', () => {
    let useCase: RemoverPortadorUseCase;
    let repo: jest.Mocked<IPortadorRepository>;

    beforeEach(() => {
        repo = mockPortadorRepository() as jest.Mocked<IPortadorRepository>;
        useCase = new RemoverPortadorUseCase(repo);
    });

    it('deve remover um portador com sucesso', async () => {
        repo.removerPorCpf.mockResolvedValue();

        await expect(useCase.executar('12345678900')).resolves.toBeUndefined();

        expect(repo.removerPorCpf).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException em erro de domínio (ex.: CPF inválido)', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);

        expect(repo.removerPorCpf).not.toHaveBeenCalled();
    });

    it('deve propagar erro inesperado', async () => {
        repo.removerPorCpf.mockRejectedValue(new Error('Erro inesperado'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('Erro inesperado');
    });
});
