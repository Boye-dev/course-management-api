import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { HasRoles } from 'src/core/decorators/role.decorator';
import { CreateDepartmentDto } from 'src/core/dto/department.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
import { DepartmentUseCases } from 'src/use-cases/department/department.use-case';

@ApiTags('Department')
@ApiBearerAuth('JWT')
@Controller('api/department')
export class DepartmentController {
  constructor(private departmentUseCases: DepartmentUseCases) {}

  @ApiBody({
    type: CreateDepartmentDto,
    description: 'Create Department Json',
  })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post()
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentUseCases.createDepartment(createDepartmentDto);
  }
}
