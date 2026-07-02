import { UpdateArticleDto } from '../../dto';

export class UpdateArticleCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateArticleDto
  ) {}
}
