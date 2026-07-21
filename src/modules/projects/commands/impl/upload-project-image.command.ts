import { Command } from '@nestjs/cqrs';
import { Project } from '../../entities/project.entity';

export class UploadProjectImage extends Command<Project> {
  constructor(
    public readonly id: string,
    public readonly file: Express.Multer.File
  ) {
    super();
  }
}
