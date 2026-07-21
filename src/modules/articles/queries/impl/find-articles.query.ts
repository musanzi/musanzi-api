import { IFilterArticles } from '../../interfaces';

export class FindArticles {
  constructor(
    public readonly params: IFilterArticles,
    public readonly includeUnpublished = false
  ) {}
}
