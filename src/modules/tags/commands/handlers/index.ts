import { Provider } from '@nestjs/common';
import { CreateTagHandler } from './create-tag.handler';
import { DeleteTagHandler } from './delete-tag.handler';
import { UpdateTagHandler } from './update-tag.handler';

export const CommandHandlers: Provider[] = [CreateTagHandler, UpdateTagHandler, DeleteTagHandler];
