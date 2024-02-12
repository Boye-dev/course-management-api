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
import { IdParamsDto, MyStudentsParamsDto } from 'src/core/dto/auth.dto';
import {
  CreateCourseDto,
  EnrollCourseStudentDto,
  EnrollCourseTeacherDto,
  UpdateCourseDto,
  UpdateScoreDto,
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
  @HasRoles(RolesEnum.Admin)
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
    type: EnrollCourseStudentDto,
    description: 'Course object json',
  })
  @ApiParam({ name: 'id', description: 'Student Id' })
  @HasRoles(RolesEnum.Student)
  @UseGuards(JwtGuard, RolesGuard)
  @Post('enroll/student/:id')
  async studentEnroll(
    @Body() enrollDto: EnrollCourseStudentDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;

    return this.courseUseCases.studentEnroll(id, enrollDto);
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

  @ApiBody({
    type: UpdateScoreDto,
    description: 'Course object json',
  })
  @ApiParam({ name: 'id', description: 'Course Id' })
  @HasRoles(RolesEnum.Teacher)
  @UseGuards(JwtGuard, RolesGuard)
  @Patch('update-score/:id')
  async updateScore(
    @Body() updateCourseDto: UpdateScoreDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;
    return this.courseUseCases.updateScore(id, updateCourseDto.score);
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
  async getTeacherEnrolledCourses(
    @Param() params: IdParamsDto,
    @Query() query: CourseQueryDto,
  ) {
    const { id } = params;

    return this.courseUseCases.getTeacherEnrolledCourses(id, query);
  }

  @HasRoles(RolesEnum.Student)
  @UseGuards(JwtGuard)
  @Get('enrolled-teacher')
  async getEnrolledCourses(@Query() query: CourseQueryDto) {
    return this.courseUseCases.getStudentEnrolledCourses(query);
  }

  @ApiParam({ name: 'id', description: 'Student Id' })
  @HasRoles(RolesEnum.Student)
  @HasRoles(RolesEnum.Teacher)
  @UseGuards(JwtGuard)
  @Get('enrolled-student/:id')
  async getEnrolledMyCourses(
    @Query() query: CourseQueryDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;

    return this.courseUseCases.getStudentMyCourses(id, query);
  }

  @ApiParam({ name: 'id', description: 'Course Id' })
  @ApiParam({ name: 'teacherId', description: 'Teacher Id' })
  @ApiParam({ name: 'year', description: 'Year' })
  @HasRoles(RolesEnum.Teacher)
  @UseGuards(JwtGuard)
  @Get('enrolled-student/:id/:year/:teacherId')
  async getTeacherstMyStudents(
    @Param() params: MyStudentsParamsDto,
    @Query() query: CourseQueryDto,
  ) {
    const { id, year, teacherId } = params;

    return this.courseUseCases.getTeacherstMyStudents(
      teacherId,
      id,
      year,
      query,
    );
  }
}
