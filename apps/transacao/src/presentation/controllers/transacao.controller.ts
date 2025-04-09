import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CriarTransacaoUseCase } from '../../application/use-cases/criar-transacao.use-case';
import { ConsultarExtratoUseCase } from '../../application/use-cases/consultar-extrato.use-case';
import { CriarTransacaoDto } from '../dtos/criar-transacao.dto';
import { TransacaoResponseDto } from '../dtos/transacao-response.dto';
import { ConsultarExtratoDto } from '../dtos/consultar-extrato.dto';

@ApiTags('Transações')
@Controller('transacoes')
export class TransacaoController {
  constructor(
    private readonly criarTransacaoUseCase: CriarTransacaoUseCase,
    private readonly consultarExtratoUseCase: ConsultarExtratoUseCase,
  ) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cria uma nova transação (saque ou depósito)' })
  @ApiResponse({ status: 201, description: 'Transação criada com sucesso' })
  async criar(@Body() dto: CriarTransacaoDto): Promise<void> {
    await this.criarTransacaoUseCase.executar(dto);
  }

  @Get('extrato/:cpf')
  @ApiOperation({ summary: 'Consulta extrato por CPF e período' })
  @ApiQuery({ name: 'inicio', required: true, type: String, description: 'Data início (YYYY-MM-DD)' })
  @ApiQuery({ name: 'fim', required: true, type: String, description: 'Data fim (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Extrato retornado com sucesso',
    type: [TransacaoResponseDto],
  })
  async consultarExtrato(@Query() query: ConsultarExtratoDto): Promise<TransacaoResponseDto[]> {
    const { cpf, inicio, fim } = query;

    const inicioDate = new Date(inicio);
    const fimDate = new Date(fim);

    return this.consultarExtratoUseCase.executar(cpf, inicioDate, fimDate);
  }

}
