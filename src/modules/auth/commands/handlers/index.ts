import { Provider } from '@nestjs/common';
import { ForgotPasswordHandler } from './forgot-password.handler';
import { ResetPasswordHandler } from './reset-password.handler';
import { SignOutHandler } from './sign-out.handler';
import { UpdatePasswordHandler } from './update-password.handler';
import { UpdateProfileHandler } from './update-profile.handler';

export const CommandHandlers: Provider[] = [
  SignOutHandler,
  UpdateProfileHandler,
  UpdatePasswordHandler,
  ForgotPasswordHandler,
  ResetPasswordHandler
];
