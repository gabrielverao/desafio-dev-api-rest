import { CriarPortadorUseCase } from '../criar-portador.use-case';
import { IPortadorRepository } from '../../interfaces/portador.repository';
import { EventPublisher } from '@shared/events/event-publisher.interface';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { Portador } from '../../../domain/entities/portador.entity';

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});

const mockPortadorRepository = () => ({
    buscarPorCpf: jest.fn(),
    salvar: jest.fn(),
    removerPorCpf: jest.fn()
});

const mockEventPublisher = () => ({
    publish: jest.fn(),
});

describe('CriarPortadorUseCase', () => {
    let useCase: CriarPortadorUseCase;
    let repo: jest.Mocked<IPortadorRepository>;
    let publisher: jest.Mocked<EventPublisher>;

    beforeEach(() => {
        repo = mockPortadorRepository() as jest.Mocked<IPortadorRepository>;
        publisher = mockEventPublisher() as jest.Mocked<EventPublisher>;

        useCase = new CriarPortadorUseCase(repo, publisher);
    });

    it('deve criar um portador com sucesso', async () => {
        repo.buscarPorCpf.mockResolvedValue(null);

        const nomeCompleto = 'Gabriel Augusto';
        const cpfTexto = '12345678900';

        await useCase.executar(nomeCompleto, cpfTexto);

        expect(repo.buscarPorCpf).toHaveBeenCalled();
        expect(repo.salvar).toHaveBeenCalledWith(expect.any(Portador));
        expect(publisher.publish).toHaveBeenCalled();
    });

    it('deve lançar ConflictException se CPF já existe', async () => {
        repo.buscarPorCpf.mockResolvedValue(new Portador('id-1', 'Outro Nome', '12345678900'));

        await expect(useCase.executar('Gabriel Augusto', '12345678900'))
            .rejects
            .toThrow(ConflictException);

        expect(repo.salvar).not.toHaveBeenCalled();
        expect(publisher.publish).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException em erro de domínio (ex.: nome inválido)', async () => {
        await expect(useCase.executar('', '12345678900'))
            .rejects
            .toThrow(BadRequestException);

        expect(repo.salvar).not.toHaveBeenCalled();
        expect(publisher.publish).not.toHaveBeenCalled();
    });

    it('deve propagar erro desconhecido', async () => {
        repo.buscarPorCpf.mockImplementation(() => { throw new Error('Erro inesperado'); });

        await expect(useCase.executar('Gabriel Augusto', '12345678900'))
            .rejects
            .toThrow(Error);

        expect(repo.salvar).not.toHaveBeenCalled();
        expect(publisher.publish).not.toHaveBeenCalled();
    });
});
