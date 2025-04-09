import { AtualizarContaUseCase } from '../atualizar-conta.use-case';
import { IContaRepository } from '../../interfaces/conta.repository';
import { Conta } from '../../../domain/entities/conta.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const mockContaRepository = () => ({
  buscarPorCpf: jest.fn(),
  salvar: jest.fn(),
});

describe('AtualizarContaUseCase', () => {
  let useCase: AtualizarContaUseCase;
  let repo: jest.Mocked<IContaRepository>;

  beforeEach(() => {
    repo = mockContaRepository() as jest.Mocked<IContaRepository>;
    useCase = new AtualizarContaUseCase(repo);
  });

  it('deve realizar depósito com sucesso', async () => {
    const conta = Conta.criar('12345678900');
    repo.buscarPorCpf.mockResolvedValue(conta);

    await useCase.executar({
      cpf: conta.cpf,
      tipo: TipoOperacao.DEPOSITO,
      valor: 500,
    });

    expect(conta.saldo).toBe(500);
    expect(repo.salvar).toHaveBeenCalledWith(expect.objectContaining({ saldo: 500 }));
  });

  it('deve realizar saque com sucesso', async () => {
    const conta = Conta.criar('12345678900');
    conta.depositar(1000);
    repo.buscarPorCpf.mockResolvedValue(conta);

    await useCase.executar({
      cpf: conta.cpf,
      tipo: TipoOperacao.SAQUE,
      valor: 200,
    });

    expect(conta.saldo).toBe(800);
    expect(repo.salvar).toHaveBeenCalled();
  });

  it('deve lançar NotFoundException se conta não encontrada', async () => {
    repo.buscarPorCpf.mockResolvedValue(null);

    await expect(
      useCase.executar({
        cpf: '12345678900',
        tipo: TipoOperacao.SAQUE,
        valor: 100,
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve lançar BadRequestException em erro de domínio', async () => {
    const conta = Conta.criar('12345678900');
    conta.depositar(100); // saldo insuficiente para saque de 200

    repo.buscarPorCpf.mockResolvedValue(conta);

    await expect(
      useCase.executar({
        cpf: conta.cpf,
        tipo: TipoOperacao.SAQUE,
        valor: 200,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('deve propagar erro desconhecido', async () => {
    repo.buscarPorCpf.mockRejectedValue(new Error('Falha inesperada'));

    await expect(
      useCase.executar({
        cpf: '12345678900',
        tipo: TipoOperacao.DEPOSITO,
        valor: 100,
      }),
    ).rejects.toThrow('Falha inesperada');
  });
});
