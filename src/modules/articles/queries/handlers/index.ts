import { Provider } from '@nestjs/common';
import { FindArticleByIdHandler } from './find-article-by-id.handler';
import { FindArticleBySlugHandler } from './find-article-by-slug.handler';
import { FindArticlesHandler } from './find-articles.handler';

export const QueryHandlers: Provider[] = [FindArticlesHandler, FindArticleByIdHandler, FindArticleBySlugHandler];
