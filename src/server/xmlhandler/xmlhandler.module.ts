import { Module } from '@nestjs/common';
import { XmlhandlerController } from './xmlhandler.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { XmlhandlerService } from './xmlhandler.service';
@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        dest: configService.get("UPLOAD_DEST"),
      }),
      inject: [ConfigService],
    }), ConfigModule],
  controllers: [XmlhandlerController],
  providers: [XmlhandlerService]
})
export class XmlhandlerModule {}
