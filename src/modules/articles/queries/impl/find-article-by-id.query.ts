export class FindArticleById {
  constructor(
    public readonly id: string,
    public readonly includeContent = false
  ) {}
}
