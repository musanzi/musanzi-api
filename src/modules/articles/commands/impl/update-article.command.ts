export class UpdateArticle {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly summary?: string,
    public readonly content?: string,
    public readonly publishedAt?: string | null,
    public readonly tagIds?: string[]
  ) {}
}
