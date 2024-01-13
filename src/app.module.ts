import { Module } from '@nestjs/common';
import { DataServicesModule } from './services/data-services/data-services.module';
import { UserUseCaseModule } from './use-cases/user/user-use-case.module';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './controllers/user.controller';
import { AwsServiceModule } from './services/aws-service/aws-service.module';
import { AuthUseCaseModule } from './use-cases/auth/auth-use-case.module';
import { AuthController } from './controllers/auth.controller';
import { HelperServiceModule } from './services/helper.service.ts/helper-service.module';
import { MailServiceModule } from './services/mail-service/mail-service.module';
import { SchoolUseCaseModule } from './use-cases/school/school-use-case.module';
import { SchoolController } from './controllers/school.controller';
import { DepartmentUseCaseModule } from './use-cases/department/department-use-case.module';
import { DepartmentController } from './controllers/department.controller';
import { SettingUseCaseModule } from './use-cases/setting/setting-uses-case.module';
import { SettingController } from './controllers/setting.controller';

@Module({
  imports: [
    DataServicesModule,
    AwsServiceModule,
    MailServiceModule,
    HelperServiceModule,
    UserUseCaseModule,
    AuthUseCaseModule,
    SchoolUseCaseModule,
    DepartmentUseCaseModule,
    SettingUseCaseModule,
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
  ],
  controllers: [
    UserController,
    AuthController,
    SchoolController,
    DepartmentController,
    SettingController,
  ],
})
export class AppModule {}
//CMS APP
