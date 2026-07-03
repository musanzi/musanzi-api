import { Provider } from '@nestjs/common';
import { FindTagByIdHandler } from './find-tag-by-id.handler';
import { FindTagsHandler } from './find-tags.handler';
import { FindTagsByIdsHandler } from './find-tags-by-ids.handler';

export const QueryHandlers: Provider[] = [FindTagsHandler, FindTagByIdHandler, FindTagsByIdsHandler];
