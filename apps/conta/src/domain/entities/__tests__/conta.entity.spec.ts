import { Conta } from '../conta.entity';
import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';

describe('Conta (Domain)', () => {
    it('deve criar uma conta válida com saldo 0 e ativa', () => {
        const conta = Conta.criar('12345678900');

        expect(conta).toBeInstanceOf(Conta);
        expect(conta.cpf).toBe('12345678900');
        expect(conta.saldo).toBe(0);
        expect(conta.ativa).toBe(true);
        expect(conta.bloqueada).toBe(false);
        expect(conta.numero).toHaveLength(8);
    });

    it('deve permitir depósito e atualizar saldo', () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(500);

        expect(conta.saldo).toBe(500);
    });

    it('deve permitir saque se saldo e limite estiverem ok', () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(1000);
        conta.sacar(500, 0);

        expect(conta.saldo).toBe(500);
    });

    it('deve lançar erro se tentar sacar mais do que o saldo', () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(100);

        expect(() => conta.sacar(200, 0)).toThrow(DomainException);
        expect(() => conta.sacar(200, 0)).toThrow(DomainErrors.SALDO_INSUFICIENTE);
    });

    it('deve lançar erro se ultrapassar o limite diário de saque', () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(3000);

        expect(() => conta.sacar(1500, 600)).toThrow(DomainErrors.LIMITE_DIARIO_EXCEDIDO);
    });

    it('deve bloquear e desbloquear a conta', () => {
        const conta = Conta.criar('12345678900');

        conta.bloquear();
        expect(conta.bloqueada).toBe(true);

        conta.desbloquear();
        expect(conta.bloqueada).toBe(false);
    });

    it('não deve bloquear conta já bloqueada', () => {
        const conta = Conta.criar('12345678900');
        conta.bloquear();

        expect(() => conta.bloquear()).toThrow(DomainErrors.CONTA_JA_BLOQUEADA);
    });

    it('deve encerrar a conta se saldo for 0', () => {
        const conta = Conta.criar('12345678900');

        conta.encerrar();

        expect(conta.ativa).toBe(false);
    });

    it('não deve encerrar conta com saldo positivo', () => {
        const conta = Conta.criar('12345678900');
        conta.depositar(100);

        expect(() => conta.encerrar()).toThrow(DomainErrors.CONTA_COM_SALDO);
    });

    it('deve ativar conta inativa', () => {
        const conta = Conta.criar('12345678900');
        conta.encerrar();

        conta.ativar();
        expect(conta.ativa).toBe(true);
    });

    it('não deve ativar conta já ativa', () => {
        const conta = Conta.criar('12345678900');

        expect(() => conta.ativar()).toThrow(DomainErrors.CONTA_JA_ATIVA);
    });
});
