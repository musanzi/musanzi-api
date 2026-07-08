import { Provider } from '@nestjs/common';
import { CreateUserHandler } from './create-user.handler';
import { DeleteUserHandler } from './delete-user.handler';
import { UpdateUserHandler } from './update-user.handler';
import { UploadUserAvatarHandler } from './upload-user-avatar.handler';

export const CommandHandlers: Provider[] = [
  CreateUserHandler,
  UpdateUserHandler,
  DeleteUserHandler,
  UploadUserAvatarHandler
];
