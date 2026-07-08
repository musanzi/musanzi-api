import { Provider } from '@nestjs/common';
import { ProfileHandler } from './profile.handler';
import { SignInHandler } from './sign-in.handler';
import { ValidateCredentialsHandler } from './validate-credentials.handler';

export const QueryHandlers: Provider[] = [SignInHandler, ProfileHandler, ValidateCredentialsHandler];
