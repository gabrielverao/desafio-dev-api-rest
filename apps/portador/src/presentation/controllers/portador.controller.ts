import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { CriarPortadorUseCase } from '../../application/use-cases/criar-portador.use-case';
import { RemoverPortadorUseCase } from '../../application/use-cases/remover-portador.use-case';
import { BuscarPortadorPorCpfUseCase } from '../../application/use-cases/buscar-portador.use-case';

import { CriarPortadorDto } from '../dtos/criar-portador.dto';
import { PortadorResponseDto } from '../dtos/portador-response.dto';

@ApiTags('Portadores')
@Controller('portadores')
export class PortadorController {
  constructor(
    private readonly criarPortador: CriarPortadorUseCase,
    private readonly removerPortador: RemoverPortadorUseCase,
    private readonly buscarPortador: BuscarPortadorPorCpfUseCase,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Cria um novo portador' })
  @ApiResponse({ status: 201, description: 'Portador criado com sucesso' })
  @ApiResponse({ status: 400, description: 'CPF inválido ou já cadastrado' })
  async criar(@Body() dto: CriarPortadorDto): Promise<void> {
    await this.criarPortador.executar(dto.nomeCompleto, dto.cpf);
  }

  @Delete(':cpf')
  @ApiOperation({ summary: 'Remove um portador via soft delete' })
  @ApiResponse({ status: 204, description: 'Portador removido com sucesso' })
  @ApiResponse({ status: 400, description: 'CPF inválido' })
  async remover(@Param('cpf') cpf: string): Promise<void> {
    await this.removerPortador.executar(cpf);
  }

  @Get(':cpf')
  @ApiOperation({ summary: 'Consulta portador por CPF' })
  @ApiResponse({
    status: 200,
    description: 'Portador encontrado',
    type: PortadorResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Portador não encontrado' })
  async buscar(
    @Param('cpf') cpf: string,
  ): Promise<PortadorResponseDto> {
    return await this.buscarPortador.executar(cpf);
  }
}
