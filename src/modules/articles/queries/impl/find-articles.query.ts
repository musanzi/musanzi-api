import { IFilterArticles } from '../../interfaces';

export class FindArticlesQuery {
  constructor(
    public readonly params: IFilterArticles,
    public readonly includeUnpublished = false
  ) {}
}
