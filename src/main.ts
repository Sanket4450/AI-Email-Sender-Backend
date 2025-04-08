import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './app/filter/http-exception.filter';
import { SanitizeInputPipe } from './app/pipes/sanitize-input.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({});

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalPipes(new SanitizeInputPipe());

  app.useGlobalFilters(new AllExceptionsFilter());

  const port = process.env.PORT || 3000;

  await app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
  });
}
bootstrap();
