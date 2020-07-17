import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {NestExpressApplication} from '@nestjs/platform-express'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  const options = new DocumentBuilder()
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('swaggerapi', app, document);
  //app.setBaseViewsDir(path.join(__dirname,'views'));
  //app.set('view engine','js');
  //app.engine('js', require('express-react-views').createEngine());
  await app.listen(3000);
}
bootstrap();
