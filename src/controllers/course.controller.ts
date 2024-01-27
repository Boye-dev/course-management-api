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
  CreateCourseDto,
  EnrollCourseTeacherDto,
  UpdateCourseDto,
} from 'src/core/dto/course.dto';
import { CourseQueryDto } from 'src/core/dto/query.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { CourseUseCases } from 'src/use-cases/course/course.use-case';

@ApiTags('Course')
@ApiBearerAuth('JWT')
@Controller('api/course')
export class CourseController {
  constructor(private courseUseCases: CourseUseCases) {}

  @ApiBody({
    type: CreateCourseDto,
    description: 'Course object json',
  })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  async createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseUseCases.createCourse(createCourseDto);
  }

  @ApiBody({
    type: EnrollCourseTeacherDto,
    description: 'Course object json',
  })
  @ApiParam({ name: 'id', description: 'Teacher Id' })
  @HasRoles(RolesEnum.Teacher)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('enroll/:id')
  async teacherEnroll(
    @Body() enrollDto: EnrollCourseTeacherDto,
    @Param() params: IdParamsDto,
  ) {
    const { courses } = enrollDto;
    const { id } = params;

    return this.courseUseCases.teacherEnroll(id, courses);
  }

  @ApiBody({
    type: UpdateCourseDto,
    description: 'Course object json',
  })
  @ApiParam({ name: 'id' })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch(':id')
  async editCourse(
    @Body() updateCourseDto: UpdateCourseDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;
    return this.courseUseCases.editCourse(updateCourseDto, id);
  }

  @HasRoles(RolesEnum.Admin, RolesEnum.Teacher)
  @UseGuards(JwtGuard, RolesGuard)
  @Get()
  async getAll(@Query() query: CourseQueryDto) {
    return this.courseUseCases.getAll(query);
  }

  @ApiParam({ name: 'id', description: 'Teacher Id' })
  @HasRoles(RolesEnum.Teacher)
  @UseGuards(JwtGuard)
  @Get('enrolled/:id')
  async getUser(@Param() params: IdParamsDto) {
    const { id } = params;

    return this.courseUseCases.getTeacherEnrolledCourses(id);
  }
}
