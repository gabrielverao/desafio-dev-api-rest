import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class PortadorHealthService {
    constructor(private readonly httpService: HttpService) { }

    async isHealthy(): Promise<HealthIndicatorResult> {
        try {
            const response = await firstValueFrom(
                this.httpService.get('http://localhost:3000/health'),
            );

            const isUp = response.status === 200;

            return {
                'portador-http': {
                    status: isUp ? 'up' : 'down',
                },
            };
        } catch (error) {
            return {
                'portador-http': {
                    status: 'down',
                    message: error.message,
                },
            };
        }
    }
}
