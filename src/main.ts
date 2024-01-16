// import * as csurf from 'csurf';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(helmet());
  const corsOptions = {
    credentials: true,
    origin: ['http://localhost:5173', 'https://babcock-cms.vercel.app'],
  };
  app.enableCors(corsOptions);

  const config = new DocumentBuilder()
    .setTitle('Course Management System Api')
    .setDescription(
      'This is the api documentation for Course Management System ',
    )
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(
          validationErrors.reduce((obj: any[], property: ValidationError) => {
            obj.push({
              field: property.property,
              errors: [...Object.values(property.constraints)],
            });
            return obj;
          }, []),
        );
      },
    }),
  );
  // app.use(csurf());

  const serverPort = configService.get<number>('SERVER_PORT');
  const port = configService.get<number>('PORT');
  await app.listen(port || serverPort);

  console.log(`Server is listening on port ${port || serverPort}...`);
}
bootstrap();
