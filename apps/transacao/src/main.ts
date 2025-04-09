import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransacaoModule } from './transacao.module';

async function bootstrap() {
  const app = await NestFactory.create(TransacaoModule);

  const config = new DocumentBuilder()
    .setTitle('Transação')
    .setDescription('Microserviço responsável por saques e depósitos')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(3002);
}
bootstrap();
