import { IPagination } from '@/shared/interfaces';

export type ArticleStatusFilter = 'all' | 'draft' | 'published';

export interface IFilterArticles extends IPagination {
  q?: string;
  tagId?: string;
  status?: ArticleStatusFilter;
}
