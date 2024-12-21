import {
  Controller,
  Get,
  HttpStatus,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedRequest } from '../types/authReq.type';
import { controllerLogger } from '../utils/logger';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async auth() {
    controllerLogger.log('Google login initiated');
  }

 @Get('google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthCallback(@Req() req: AuthenticatedRequest, @Res() res: Response) {
  try {
    const token = await this.authService.signIn(req.user);
    controllerLogger.log(`Google login callback successful for user: ${req.user.email}`);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.status(HttpStatus.OK).redirect('/api/vinyl/all');
  } catch (error) {
    controllerLogger.error('Error during Google login callback', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Failed to authenticate');
  }
}

  @Get('logout')
async logout(@Res() res: Response) {
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
    res.status(HttpStatus.OK).send({ message: 'Logged out successfully' });
}

}
