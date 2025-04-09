import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PortadorHttpService {
  constructor(private readonly http: HttpService) {}

  async verificarCpfExiste(cpf: string): Promise<void> {
    try {
      await lastValueFrom(this.http.get(`http://localhost:3000/portadores/${cpf}`));
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException('CPF não cadastrado como portador');
      }

      throw new Error('Erro ao validar CPF no serviço de portador');
    }
  }
}
