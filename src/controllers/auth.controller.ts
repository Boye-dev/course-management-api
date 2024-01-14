import {
  Body,
  Controller,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import {
  IdParamsDto,
  LoginDto,
  OtpDto,
  RefreshDto,
} from 'src/core/dto/auth.dto';
import { AuthUseCases } from 'src/use-cases/auth/auth.use-case';
import { LocalAuthGuard } from 'src/use-cases/auth/guards/local-auth.guard';
import { RefreshJwtGuard } from 'src/use-cases/auth/guards/refresh-jwt-auth.gurad';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authUseCases: AuthUseCases) {}

  @ApiBody({
    type: LoginDto,
    description: 'Json structure for auth object',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return await this.authUseCases.login(req.user);
  }

  @ApiBody({
    type: RefreshDto,
    description: 'Json structure for auth object',
  })
  @UseGuards(RefreshJwtGuard)
  @Post('refresh')
  async refreshToken(@Request() req) {
    return this.authUseCases.refreshToken(req.user);
  }

  @ApiBody({
    type: OtpDto,
    description: 'Json structure for auth object',
  })
  @ApiParam({ name: 'id' })
  @Post('otp/verify/:id')
  async verifyOtp(@Body() otpDto: OtpDto, @Param() params: IdParamsDto) {
    const { id } = params;
    const { otp } = otpDto;
    return this.authUseCases.verifyOtp(id, otp);
  }
}
