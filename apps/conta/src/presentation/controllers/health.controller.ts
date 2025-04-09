// apps/conta/src/presentation/controllers/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { RabbitmqHealthService } from '../../infrastructure/health/rabbitmq.health';
import { PortadorHealthService } from '../../infrastructure/health/portador-http.health';

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
        private readonly rabbit: RabbitmqHealthService,
        private readonly portadorHttp: PortadorHealthService,
    ) { }

    @Get()
    @HealthCheck()
    async check() {
        const rabbitStatus = await this.rabbit.check();

        return this.health.check([
            async () => this.db.pingCheck('postgres'),
            async () => rabbitStatus,
            async () => this.portadorHttp.isHealthy(),
        ]);
    }
}
