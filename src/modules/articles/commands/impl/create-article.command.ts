export class CreateArticle {
  constructor(
    public readonly title: string,
    public readonly summary: string,
    public readonly content: string,
    public readonly publishedAt?: string | null,
    public readonly tagIds?: string[]
  ) {}
}
