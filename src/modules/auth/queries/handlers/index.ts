import { Provider } from '@nestjs/common';
import { GetProfileHandler } from './get-profile.handler';
import { SignInHandler } from './sign-in.handler';
import { ValidateCredentialsHandler } from './validate-credentials.handler';

export const QueryHandlers: Provider[] = [SignInHandler, GetProfileHandler, ValidateCredentialsHandler];
