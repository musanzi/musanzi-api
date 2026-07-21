import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AbstractController } from '@/shared/abstracts';
import { User } from '../../users/entities/user.entity';
import { IUserResponse } from '../../users/interfaces';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { UpdatePasswordDto } from '@/modules/auth/dto/update-password.dto';
import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { ResetPasswordDto } from '@/modules/auth/dto/reset-password.dto';
import { Public } from '../decorators/public.decorator';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  ForgotPassword,
  ResetPassword,
  SignOut,
  UpdatePassword,
  UpdateProfile
} from '../commands';
import { Profile, SignIn } from '../queries';

@Controller('auth')
export class AuthController extends AbstractController {
  @Post('signin')
  @Public()
  @UseGuards(LocalAuthGuard)
  signIn(@Req() req: Request): Promise<IUserResponse> {
    return this.queryBus.execute(new SignIn(req));
  }

  @Post('signout')
  signOut(@Req() req: Request): Promise<void> {
    return this.commandBus.execute(new SignOut(req));
  }

  @Get('me')
  profile(@CurrentUser() user: User): Promise<IUserResponse> {
    return this.queryBus.execute(new Profile(user));
  }

  @Patch('me/update')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto): Promise<IUserResponse> {
    return this.commandBus.execute(new UpdateProfile(user, dto));
  }

  @Patch('password/update')
  updatePassword(@CurrentUser() user: User, @Body() dto: UpdatePasswordDto): Promise<IUserResponse> {
    return this.commandBus.execute(new UpdatePassword(user, dto));
  }

  @Post('password/forgot')
  @Public()
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.commandBus.execute(new ForgotPassword(dto));
  }

  @Post('password/reset')
  @Public()
  resetPassword(@Body() dto: ResetPasswordDto): Promise<IUserResponse> {
    return this.commandBus.execute(new ResetPassword(dto));
  }
}
