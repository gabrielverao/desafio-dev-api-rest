import { BuscarPortadorPorCpfUseCase } from '../buscar-portador.use-case';
import { IPortadorRepository } from '../../interfaces/portador.repository';
import { Portador } from '../../../domain/entities/portador.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockPortadorRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn(),
    removerPorCpf: jest.fn()
});

describe('BuscarPortadorPorCpfUseCase', () => {
    let useCase: BuscarPortadorPorCpfUseCase;
    let repo: jest.Mocked<IPortadorRepository>;

    beforeEach(() => {
        repo = mockPortadorRepository() as jest.Mocked<IPortadorRepository>;
        useCase = new BuscarPortadorPorCpfUseCase(repo);
    });

    it('deve retornar DTO se portador for encontrado', async () => {
        const cpf = '12345678900';
        const portadorFake = new Portador('id-portador', 'Gabriel Augusto', cpf);

        repo.buscarPorCpf.mockResolvedValue(portadorFake);

        const result = await useCase.executar(cpf);

        expect(result).toMatchObject({
            id: portadorFake.id,
            nomeCompleto: portadorFake.nomeCompleto,
            cpf: portadorFake.cpf,
        });

        expect(repo.buscarPorCpf).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException se portador não for encontrado', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        await expect(useCase.executar('12345678900')).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se CPF for inválido (erro de domínio)', async () => {
        const cpfInvalido = '';

        await expect(useCase.executar(cpfInvalido)).rejects.toThrow(BadRequestException);
    });

    it('deve propagar erros inesperados', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('erro inesperado'));

        await expect(useCase.executar('12345678900')).rejects.toThrow('erro inesperado');
    });
});
