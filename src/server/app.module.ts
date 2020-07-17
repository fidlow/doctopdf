import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { XmlhandlerModule } from "./xmlhandler/xmlhandler.module";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    XmlhandlerModule,
    ConfigModule.forRoot({ envFilePath: [".env.development"] })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
