export class UploadArticleCover {
  constructor(
    public readonly id: string,
    public readonly file: Express.Multer.File
  ) {}
}
