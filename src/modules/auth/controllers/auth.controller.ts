import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';
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
  ForgotPasswordCommand,
  ResetPasswordCommand,
  SignOutCommand,
  UpdatePasswordCommand,
  UpdateProfileCommand
} from '../commands';
import { ProfileQuery, SignInQuery } from '../queries';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post('signin')
  @Public()
  @UseGuards(LocalAuthGuard)
  signIn(@Req() req: Request): Promise<IUserResponse> {
    return this.queryBus.execute(new SignInQuery(req));
  }

  @Post('signout')
  signOut(@Req() req: Request): Promise<void> {
    return this.commandBus.execute(new SignOutCommand(req));
  }

  @Get('me')
  profile(@CurrentUser() user: User): Promise<IUserResponse> {
    return this.queryBus.execute(new ProfileQuery(user));
  }

  @Patch('me/update')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto): Promise<IUserResponse> {
    return this.commandBus.execute(new UpdateProfileCommand(user, dto));
  }

  @Patch('password/update')
  updatePassword(@CurrentUser() user: User, @Body() dto: UpdatePasswordDto): Promise<IUserResponse> {
    return this.commandBus.execute(new UpdatePasswordCommand(user, dto));
  }

  @Post('password/forgot')
  @Public()
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.commandBus.execute(new ForgotPasswordCommand(dto));
  }

  @Post('password/reset')
  @Public()
  resetPassword(@Body() dto: ResetPasswordDto): Promise<IUserResponse> {
    return this.commandBus.execute(new ResetPasswordCommand(dto));
  }
}
