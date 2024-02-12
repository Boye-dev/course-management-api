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
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from 'src/core/dto/department.dto';
import { DepartmentQueryDto } from 'src/core/dto/query.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { DepartmentUseCases } from 'src/use-cases/department/department.use-case';

@ApiTags('Department')
@ApiBearerAuth('JWT')
@Controller('api/department')
export class DepartmentController {
  constructor(private departmentUseCases: DepartmentUseCases) {}

  @ApiBody({
    type: CreateDepartmentDto,
    description: 'Department object json',
  })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  async createDepartment(@Body() createDepartmentDto: CreateDepartmentDto) {
    return this.departmentUseCases.createDepartment(createDepartmentDto);
  }

  @ApiBody({
    type: UpdateDepartmentDto,
    description: 'Department object json',
  })
  @ApiParam({ name: 'id' })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id')
  async editDepartment(
    @Body() updateDepartmentDto: UpdateDepartmentDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;
    return this.departmentUseCases.editDepartment(updateDepartmentDto, id);
  }

  @UseGuards(JwtGuard)
  @Get()
  async getAll(@Query() query: DepartmentQueryDto) {
    return this.departmentUseCases.getAll(query);
  }
}
