import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleById } from '../../queries';
import { UploadArticleCover } from '../impl';

@CommandHandler(UploadArticleCover)
export class UploadArticleCoverHandler implements ICommandHandler<UploadArticleCover, Article> {
  private readonly logger = new Logger(UploadArticleCoverHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UploadArticleCover): Promise<Article> {
    const { file, id } = command;

    try {
      const article = await this.queryBus.execute(new FindArticleById(id));

      if (article.cover) {
        await promises.rm(`./uploads/articles/${article.cover}`, { force: true });
      }

      await this.repository.update(id, { cover: file.filename });

      return await this.queryBus.execute(new FindArticleById(id));
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Upload article cover failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Ajout de l'image de couverture impossible");
    }
  }
}
