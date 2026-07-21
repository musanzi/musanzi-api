export class IncrementArticleViews {
  constructor(
    public readonly slug: string,
    public readonly viewerFingerprint: string
  ) {}
}
