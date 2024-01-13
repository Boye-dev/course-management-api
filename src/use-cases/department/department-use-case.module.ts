import { Module } from '@nestjs/common';
import { DepartmentFactoryService } from './department-factory.service';
import { DepartmentUseCases } from './department.use-case';
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
  providers: [DepartmentFactoryService, DepartmentUseCases],
  exports: [DepartmentFactoryService, DepartmentUseCases],
})
export class DepartmentUseCaseModule {}
