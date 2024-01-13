import { Module } from '@nestjs/common';
import { SchoolFactoryService } from './school-factory.service';
import { SchoolUseCases } from './school.use-case';
import { DataServicesModule } from 'src/services/data-services/data-services.module';
import { AwsServiceModule } from 'src/services/aws-service/aws-service.module';
import { HelperServiceModule } from 'src/services/helper.service.ts/helper-service.module';
import { MailServiceModule } from 'src/services/mail-service/mail-service.module';

@Module({
  imports: [
    DataServicesModule,
    AwsServiceModule,
    HelperServiceModule,
    MailServiceModule,
  ],
  providers: [SchoolFactoryService, SchoolUseCases],
  exports: [SchoolFactoryService, SchoolUseCases],
})
export class SchoolUseCaseModule {}
