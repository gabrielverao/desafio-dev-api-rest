import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MongooseHealthIndicator,
} from '@nestjs/terminus';
import { RabbitmqHealthService } from '../../infrastructure/health/rabbitmq.health';
import { ContaHealthService } from '../../infrastructure/health/conta-http.health';

@Controller('health')
export class HealthController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly db: TypeOrmHealthIndicator,
        private readonly mongo: MongooseHealthIndicator,
        private readonly rabbit: RabbitmqHealthService,
        private readonly contaHttp: ContaHealthService,
    ) { }

    @Get()
    @HealthCheck()
    async check() {
        const rabbitStatus = await this.rabbit.check();
        const contaStatus = await this.contaHttp.isHealthy();

        return this.health.check([
            async () => this.db.pingCheck('postgres'),
            async () => this.mongo.pingCheck('mongo'),
            async () => rabbitStatus,
            async () => contaStatus,
        ]);
    }
}
