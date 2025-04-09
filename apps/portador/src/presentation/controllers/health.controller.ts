import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { createLogger } from '@shared/logger/logger.factory';
import { RabbitmqHealthService } from '../../infrastructure/health/rabbitmq.health';

@Controller('health')
export class HealthController {
  private readonly logger = createLogger('HealthController');

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly rabbit: RabbitmqHealthService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const rabbitStatus = await this.rabbit.check();

    return this.health.check([
      async () => this.db.pingCheck('postgres'),
      async () => rabbitStatus,
    ]);
  }
}
