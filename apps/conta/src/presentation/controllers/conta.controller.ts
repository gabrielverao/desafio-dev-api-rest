import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BuscarSaldoUseCase } from '../../application/use-cases/buscar-saldo.use-case';
import { BuscarContaPorCpfUseCase } from '../../application/use-cases/buscar-conta.use-case';
import { BloquearContaUseCase } from '../../application/use-cases/bloquear-conta.use-case';
import { DesbloquearContaUseCase } from '../../application/use-cases/desbloquear-conta.use-case';
import { EncerrarContaUseCase } from '../../application/use-cases/encerrar-conta.use-case';
import { ValidarOperacaoDto } from '../dtos/validar-operacao.dto';
import { ValidarOperacaoContaUseCase } from '../../application/use-cases/validar-operacao.use-case';
import { AtivarContaUseCase } from '../../application/use-cases/ativar-conta.use-case';

@ApiTags('Contas')
@Controller('contas')
export class ContaController {
  constructor(
    private readonly buscarSaldoUseCase: BuscarSaldoUseCase,
    private readonly buscarContaPorCpfUseCase: BuscarContaPorCpfUseCase,
    private readonly bloquearContaUseCase: BloquearContaUseCase,
    private readonly desbloquearContaUseCase: DesbloquearContaUseCase,
    private readonly encerrarContaUseCase: EncerrarContaUseCase,
    private readonly validarOperacaoContaUseCase: ValidarOperacaoContaUseCase,
    private readonly ativarContaUseCase: AtivarContaUseCase,
  ) { }

  @Get(':cpf/saldo')
  @ApiOperation({ summary: 'Consulta o saldo de uma conta' })
  @ApiResponse({ status: 200, description: 'Saldo retornado com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async buscarSaldo(@Param('cpf') cpf: string) {
    const saldo = await this.buscarSaldoUseCase.executar(cpf);
    return { saldo };
  }

  @Get(':cpf')
  @ApiOperation({ summary: 'Consulta os dados completos da conta' })
  @ApiResponse({ status: 200, description: 'Conta encontrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async buscarConta(@Param('cpf') cpf: string) {
    return this.buscarContaPorCpfUseCase.executar(cpf);
  }

  @ApiOperation({ summary: 'Bloqueia uma conta existente' })
  @ApiResponse({ status: 204, description: 'Conta bloqueada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @Patch(':cpf/bloquear')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bloquear(@Param('cpf') cpf: string): Promise<void> {
    await this.bloquearContaUseCase.executar(cpf);
  }

  @Patch(':cpf/desbloquear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desbloqueia uma conta existente' })
  @ApiResponse({ status: 204, description: 'Conta desbloqueada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async desbloquear(@Param('cpf') cpf: string): Promise<void> {
    await this.desbloquearContaUseCase.executar(cpf);
  }

  @Patch(':cpf/encerrar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Encerra uma conta existente' })
  @ApiResponse({ status: 204, description: 'Conta encerrada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async encerrar(@Param('cpf') cpf: string): Promise<void> {
    await this.encerrarContaUseCase.executar(cpf);
  }

  @Patch(':cpf/ativar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Ativa uma conta existente' })
  @ApiResponse({ status: 204, description: 'Conta ativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async ativar(@Param('cpf') cpf: string): Promise<void> {
    await this.ativarContaUseCase.executar(cpf);
  }

  @Post(':cpf/validar-operacao')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Valida se uma operação pode ser realizada na conta' })
  @ApiResponse({ status: 204, description: 'Operação válida' })
  @ApiResponse({ status: 400, description: 'Operação inválida' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  async validarOperacao(
    @Param('cpf') cpf: string,
    @Body() dto: ValidarOperacaoDto,
  ): Promise<void> {
    await this.validarOperacaoContaUseCase.executar(dto, cpf);
  }
 
}
