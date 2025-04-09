import { Portador } from '../portador.entity';
import { DomainException } from '@shared/domain/domain.exception';
import { DomainErrors } from '@shared/domain/domain.errors';

describe('Portador (Domain)', () => {
    it('deve criar um portador válido', () => {
        const nome = 'Gabriel Verão';
        const cpf = '12345678900';

        const portador = Portador.criar(nome, cpf);

        expect(portador).toBeDefined();
        expect(portador.id).toBeDefined();
        expect(portador.nomeCompleto).toBe(nome);
        expect(portador.cpf).toBe(cpf);
        expect(portador.criadoEm).toBeInstanceOf(Date);
    });

    it('deve lançar exceção se nome for vazio', () => {
        expect(() => Portador.criar('', '12345678900')).toThrow(DomainException);
        expect(() => Portador.criar('', '12345678900')).toThrow(DomainErrors.NOME_OBRIGATORIO);
    });

    it('deve lançar exceção se nome for muito curto', () => {
        expect(() => Portador.criar('Jo', '12345678900')).toThrow(DomainException);
        expect(() => Portador.criar('Jo', '12345678900')).toThrow(DomainErrors.NOME_MUITO_CURTO);
    });
});
