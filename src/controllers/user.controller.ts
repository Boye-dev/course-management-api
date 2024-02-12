import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  InternalServerErrorException,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HasRoles } from 'src/core/decorators/role.decorator';
import {
  CreateTeacherOrStudentDto,
  CreateUserDto,
  UpdateUserDto,
} from 'src/core/dto';
import {
  ForgotPasswordDto,
  IdParamsDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from 'src/core/dto/auth.dto';
import { StudentQueryDto, TeacherQueryDto } from 'src/core/dto/query.dto';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { RolesEnum } from 'src/core/interfaces/user.interfaces';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { UserUseCases } from 'src/use-cases/user/user.use-case';

@ApiTags('User')
@Controller('api/user')
@ApiBearerAuth('JWT')
export class UserController {
  constructor(private userUseCases: UserUseCases) {}

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for user object',
  })
  @Post('admin')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return this.userUseCases.createUser(createUserDto, file);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while creating the user',
      );
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateTeacherOrStudentDto,
    description: 'Json structure for user object',
  })
  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('profilePicture'))
  async createTeacherOrStudent(
    @Body() createUserDto: CreateTeacherOrStudentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      return this.userUseCases.createTeacherOrStudent(createUserDto, file);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while creating the user',
      );
    }
  }

  @ApiBody({
    type: ForgotPasswordDto,
    description: 'Json structure for user object',
  })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    try {
      return this.userUseCases.forgotPassword(email);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiBody({
    type: ResetPasswordDto,
    description: 'Json structure for user object',
  })
  @ApiParam({ name: 'token' })
  @ApiParam({ name: 'id' })
  @Patch('reset-password/:token/:id')
  async resetPassword(
    @Body('password') password: string,
    @Param('token') token: string,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;

    try {
      return this.userUseCases.resetPassword(password, token, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiBody({
    type: UpdatePasswordDto,
    description: 'Json structure for user object',
  })
  @ApiParam({ name: 'id' })
  @Patch('update-password/:id')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;
    try {
      return this.userUseCases.updatePassword(updatePasswordDto, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserDto,
    description: 'Json structure for user object',
  })
  @ApiParam({ name: 'id' })
  @UseGuards(JwtGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Param() params: IdParamsDto,
  ) {
    const { id } = params;

    try {
      return this.userUseCases.updateUser(updateUserDto, file, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while updating the user',
      );
    }
  }
  @Get('verify/token/:token/:id')
  async verifyEmail(
    @Param('token') token: string,
    @Param() params: IdParamsDto,
  ) {
    try {
      const { id } = params;

      return this.userUseCases.verifyUser(token, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while verifying email',
      );
    }
  }

  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('students')
  async getAllStudents(@Query() query: StudentQueryDto) {
    return this.userUseCases.getAllStudents(query);
  }

  @HasRoles(RolesEnum.Admin)
  @UseGuards(JwtGuard, RolesGuard)
  @Get('teachers')
  async getAllTeachers(@Query() query: TeacherQueryDto) {
    return this.userUseCases.getAllTeachers(query);
  }

  @ApiParam({ name: 'id' })
  @UseGuards(JwtGuard)
  @Get(':id')
  async getUser(@Param() params: IdParamsDto) {
    const { id } = params;

    try {
      return this.userUseCases.getUser(id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while fetching user',
      );
    }
  }
}
