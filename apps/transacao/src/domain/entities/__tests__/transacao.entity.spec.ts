import { Transacao } from '../transacao.entity';
import { TipoOperacao } from '@shared/domain/enums/tipo-operacao.enum';
import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'warn').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Transacao (Domain)', () => {
    it('deve criar uma transação de depósito válida', () => {
        const transacao = Transacao.criar('12345678900', 100, TipoOperacao.DEPOSITO);

        expect(transacao).toBeInstanceOf(Transacao);
        expect(transacao.valor).toBe(100);
        expect(transacao.tipo).toBe(TipoOperacao.DEPOSITO);
        expect(transacao.id).toBeDefined();
        expect(transacao.realizadaEm).toBeInstanceOf(Date);
    });

    it('deve criar uma transação de saque válida', () => {
        const transacao = Transacao.criar('12345678900', 50, TipoOperacao.SAQUE);

        expect(transacao.tipo).toBe(TipoOperacao.SAQUE);
        expect(transacao.valor).toBe(50);
    });

    it('deve lançar DomainException se valor for zero ou negativo', () => {
        expect(() => Transacao.criar('12345678900', 0, TipoOperacao.SAQUE)).toThrow(DomainException);
        expect(() => Transacao.criar('12345678900', -10, TipoOperacao.SAQUE)).toThrow(DomainErrors.VALOR_INVALIDO);
    });
});
