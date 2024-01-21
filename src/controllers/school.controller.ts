import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/core/decorators/role.decorator';
import { IdParamsDto } from 'src/core/dto/auth.dto';
import { SchoolQueryDto } from 'src/core/dto/query.dto';
import { CreateSchoolDto, UpdateSchoolDto } from 'src/core/dto/school.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { SchoolUseCases } from 'src/use-cases/school/school.use-case';

@Controller('api/school')
@ApiTags('School')
@ApiBearerAuth('JWT')
export class SchoolController {
  constructor(private schoolUseCase: SchoolUseCases) {}
  @ApiBody({
    type: CreateSchoolDto,
    description: 'School object json',
  })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  async createSchool(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolUseCase.createSchool(createSchoolDto);
  }

  @ApiBody({
    type: UpdateSchoolDto,
    description: 'School object json',
  })
  @ApiParam({ name: 'id' })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id')
  async editSchool(
    @Body() updateSchoolDto: UpdateSchoolDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;
    return this.schoolUseCase.editSchool(updateSchoolDto, id);
  }

  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  async getAll(@Query() query: SchoolQueryDto) {
    return this.schoolUseCase.getAll(query);
  }
}
