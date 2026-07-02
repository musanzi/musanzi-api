import { Provider } from '@nestjs/common';
import { CreateArticleHandler } from './create-article.handler';
import { DeleteArticleHandler } from './delete-article.handler';
import { UpdateArticleHandler } from './update-article.handler';
import { UploadArticleCoverHandler } from './upload-article-cover.handler';

export const CommandHandlers: Provider[] = [
  CreateArticleHandler,
  UpdateArticleHandler,
  DeleteArticleHandler,
  UploadArticleCoverHandler
];
