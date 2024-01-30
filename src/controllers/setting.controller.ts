import { IdParamsDto } from './../core/dto/auth.dto';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/core/decorators/role.decorator';
import { SettingDto } from 'src/core/dto/setting.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { SettingUseCases } from 'src/use-cases/setting/setting.use-case';

@ApiTags('Settings')
@Controller('api/settings')
@ApiBearerAuth('JWT')
export class SettingController {
  constructor(private settingUseCases: SettingUseCases) {}

  @ApiBody({ type: SettingDto, description: 'Settings Json format' })
  @ApiParam({ name: 'id' })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  async updateSettings(
    @Body() updateSettingDto: SettingDto,
    @Param() params: IdParamsDto,
    @Request() req,
  ) {
    const { id } = params;

    return this.settingUseCases.updateSetting(
      id,
      updateSettingDto,
      req?.user?.id,
    );
  }
  @ApiParam({ name: 'id' })
  @UseGuards(JwtGuard)
  @Get(':id')
  async getSettings(@Param() params: IdParamsDto) {
    const { id } = params;

    return this.settingUseCases.getSettings(id);
  }
}
