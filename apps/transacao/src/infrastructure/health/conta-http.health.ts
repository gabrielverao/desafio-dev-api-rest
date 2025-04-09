import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class ContaHealthService {
    constructor(private readonly httpService: HttpService) { }

    async isHealthy(): Promise<HealthIndicatorResult> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('http://localhost:3001/health'),
            );

            const isUp = response.status === 200;

            return {
                'conta-http': {
                    status: isUp ? 'up' : 'down',
                },
            };
        } catch (error) {
            return {
                'conta-http': {
                    status: 'down',
                    message: error.message,
                },
            };
        }
    }
}
