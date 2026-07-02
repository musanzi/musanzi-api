import { Provider } from '@nestjs/common';
import { FindProjectByIdHandler } from './find-project-by-id.handler';
import { FindProjectsHandler } from './find-projects.handler';

export const QueryHandlers: Provider[] = [FindProjectsHandler, FindProjectByIdHandler];
