import { IPagination } from '@/shared/interfaces';

export interface IFilterArticles extends IPagination {
  q?: string;
  tagId?: string;
}
