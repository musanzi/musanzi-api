export class IncrementArticleViewsCommand {
  constructor(
    public readonly slug: string,
    public readonly viewerFingerprint: string
  ) {}
}
