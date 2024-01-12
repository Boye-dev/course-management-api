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
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from 'src/core/dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdatePasswordDto,
} from 'src/core/dto/auth.dto';
import { JwtGuard } from 'src/use-cases/auth/guards/jwt-auth.guard';
import { UserUseCases } from 'src/use-cases/user/user.use-case';

@ApiTags('User')
@Controller('api/user')
@ApiBearerAuth('JWT')
export class UserController {
  constructor(private userUseCases: UserUseCases) {}

  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FileInterceptor('profilePicture'))
  @ApiBody({
    type: CreateUserDto,
    description: 'Json structure for user object',
  })
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
  @Patch('reset-password/:token')
  async resetPassword(
    @Body('password') password: string,
    @Param('token') token: string,
  ) {
    try {
      return this.userUseCases.resetPassword(password, token);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  @ApiBody({
    type: UpdatePasswordDto,
    description: 'Json structure for user object',
  })
  @Patch('update-password/:id')
  async updatePassword(
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Param('id') id: string,
  ) {
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
  @UseGuards(JwtGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    try {
      return this.userUseCases.updateUser(updateUserDto, file, id);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while updating the user',
      );
    }
  }
  @Get('verify/token/:token')
  async verifyEmail(@Param('token') token: string) {
    try {
      return this.userUseCases.verifyUser(token);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'Something went wrong while verifying email',
      );
    }
  }
}
