import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { AwsServiceModule } from 'src/services/aws-service/aws-service.module';
import { HelperServiceModule } from 'src/services/helper.service.ts/helper-service.module';
import { MailServiceModule } from 'src/services/mail-service/mail-service.module';
import { SettingFactoryService } from './setting-factory.service';
import { SettingUseCases } from './setting.use-case';

@Module({
  imports: [
    DataServicesModule,
    AwsServiceModule,
    HelperServiceModule,
    MailServiceModule,
  ],
  providers: [SettingFactoryService, SettingUseCases],
  exports: [SettingFactoryService, SettingUseCases],
})
export class SettingUseCaseModule {}
