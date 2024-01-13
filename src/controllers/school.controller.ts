import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/core/decorators/role.decorator';
import { CreateSchoolDto } from 'src/core/dto/school.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
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
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async createSchool(@Body() createSchoolDto: CreateSchoolDto) {
    return this.schoolUseCase.createSchool(createSchoolDto);
  }
}
