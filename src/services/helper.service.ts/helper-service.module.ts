import { Module } from '@nestjs/common';
import { HelperModule } from 'src/frameworks/helper-services/helper/helper.module';

@Module({
  imports: [HelperModule],
  exports: [HelperModule],
})
export class HelperServiceModule {}
