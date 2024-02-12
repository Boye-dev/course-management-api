import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/core';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendVerifyEmail(user: User, token: string, password?: string) {
    try {
      const domain = this.configService.get<string>('DOMAIN_NAME');

      const url = `${domain}/verify-user/?token=${token}&id=${user._id}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        template: './verifyemail.hbs',
        context: {
          name: user.lastName,
          password: password,
          email: user.email,
          url,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error sending verrification mail',
      );
    }
  }

  async sendOtpEmail(user: User, otp: number) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Login Otp',
        template: './otpemail.hbs',
        context: {
          name: user.lastName,
          otp,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Error sending otp  mail');
    }
  }

  async sendForgotPasswordEmail(user: User, token: string) {
    try {
      const domain = this.configService.get<string>('DOMAIN_NAME');

      const url = `${domain}/resetPassword?token=${token}&id=${user._id}`;
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset',
        template: './passwordreset.hbs',
        context: {
          name: user.lastName,
          url,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Error sending password reset mail',
      );
    }
  }
}
