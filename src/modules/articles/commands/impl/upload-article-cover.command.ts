export class UploadArticleCoverCommand {
  constructor(
    public readonly id: string,
    public readonly file: Express.Multer.File
  ) {}
}
