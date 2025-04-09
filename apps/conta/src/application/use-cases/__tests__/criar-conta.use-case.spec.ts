import { CriarContaUseCase } from '../criar-conta.use-case';
import { IContaRepository } from '../../interfaces/conta.repository';
import { PortadorHttpService } from '../../../infrastructure/http/portador-http.service';
import { Conta } from '../../../domain/entities/conta.entity';
import { ConflictException, BadRequestException, InternalServerErrorException } from '@nestjs/common';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockContaRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn(),
});

const mockPortadorHttpService = () => ({
    verificarCpfExiste: jest.fn(),
});

describe('CriarContaUseCase', () => {
    let useCase: CriarContaUseCase;
    let repo: jest.Mocked<IContaRepository>;
    let portadorHttp: jest.Mocked<PortadorHttpService>;

    beforeEach(() => {
        repo = mockContaRepository() as jest.Mocked<IContaRepository>;
        portadorHttp = mockPortadorHttpService() as Partial<PortadorHttpService> as jest.Mocked<PortadorHttpService>;
        useCase = new CriarContaUseCase(repo, portadorHttp);
    });

    it('deve criar uma conta com sucesso', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);
        portadorHttp.verificarCpfExiste.mockResolvedValue(undefined);

        const result = await useCase.executar('12345678900');

        expect(result).toBeInstanceOf(Conta);
        expect(repo.buscarPorCpf).toHaveBeenCalledWith('12345678900');
        expect(portadorHttp.verificarCpfExiste).toHaveBeenCalledWith('12345678900');
        expect(repo.salvar).toHaveBeenCalledWith(expect.any(Conta));
    });

    it('deve lançar ConflictException se conta já existir', async () => {
        repo.buscarPorCpf.mockResolvedValue(Conta.criar('12345678900'));

        await expect(useCase.executar('12345678900')).rejects.toThrow(ConflictException);
        expect(portadorHttp.verificarCpfExiste).not.toHaveBeenCalled();
        expect(repo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se portador não for encontrado', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);
        portadorHttp.verificarCpfExiste.mockRejectedValue(new Error('404'));

        await expect(useCase.executar('12345678900')).rejects.toThrow(BadRequestException);
        expect(repo.salvar).not.toHaveBeenCalled();
    });

    it('deve lançar InternalServerErrorException para erro inesperado', async () => {
        repo.buscarPorCpf.mockRejectedValue(new Error('falha inesperada'));

        await expect(useCase.executar('12345678900')).rejects.toThrow(InternalServerErrorException);
    });

    it('deve lançar BadRequestException se CPF for inválido', async () => {
        await expect(useCase.executar('')).rejects.toThrow(BadRequestException);
    });
});
