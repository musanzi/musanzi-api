import { UpdateArticleDto } from '../../dto';

export class UpdateArticle {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateArticleDto
  ) {}
}
