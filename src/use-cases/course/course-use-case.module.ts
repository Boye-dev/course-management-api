import { Module } from '@nestjs/common';
import { CourseFactoryService } from './course-factory.service';
import { CourseUseCases } from './course.use-case';
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
  providers: [CourseFactoryService, CourseUseCases],
  exports: [CourseFactoryService, CourseUseCases],
})
export class CourseUseCaseModule {}
