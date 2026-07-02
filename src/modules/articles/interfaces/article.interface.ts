import { Tag } from '@/modules/tags/entities/tag.entity';
import { ArticleContentFormat } from './article-content-format.interface';

export interface IArticle {
  title: string;
  slug: string;
  summary: string;
  content: string;
  contentFormat: ArticleContentFormat;
  cover?: string | null;
  published: boolean;
  publishedAt?: Date | null;
  tags: Tag[];
}
