import { CreateArticleDto } from '../../dto';

export class CreateArticleCommand {
  constructor(public readonly dto: CreateArticleDto) {}
}
