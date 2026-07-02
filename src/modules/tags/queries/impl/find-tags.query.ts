import { IFilterTags } from '../../interfaces';

export class FindTagsQuery {
  constructor(public readonly params: IFilterTags) {}
}
