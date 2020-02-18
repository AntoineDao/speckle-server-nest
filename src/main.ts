import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const options = new DocumentBuilder()
    .setTitle('Speckle Server')
    .setDescription('The Speckle Server API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  
  // TODO: expose OpenAPI file below
  // console.log(JSON.stringify(document, null, 2))
  
  SwaggerModule.setup('openapi', app, document);

  await app.listen(3000);
}
bootstrap();
