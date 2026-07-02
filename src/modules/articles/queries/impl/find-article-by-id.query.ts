export class FindArticleByIdQuery {
  constructor(
    public readonly id: string,
    public readonly includeContent = false
  ) {}
}
