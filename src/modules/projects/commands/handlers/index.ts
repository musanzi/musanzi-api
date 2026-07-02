import { Provider } from '@nestjs/common';
import { CreateProjectHandler } from './create-project.handler';
import { DeleteProjectHandler } from './delete-project.handler';
import { UpdateProjectHandler } from './update-project.handler';
import { UploadProjectImageHandler } from './upload-project-image.handler';

export const CommandHandlers: Provider[] = [
  CreateProjectHandler,
  UpdateProjectHandler,
  DeleteProjectHandler,
  UploadProjectImageHandler
];
