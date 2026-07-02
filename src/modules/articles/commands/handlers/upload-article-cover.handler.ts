import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { promises } from 'fs';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { FindArticleByIdQuery } from '../../queries';
import { UploadArticleCoverCommand } from '../impl';

const ARTICLE_UPLOAD_DIR = './uploads/articles';

@CommandHandler(UploadArticleCoverCommand)
export class UploadArticleCoverHandler implements ICommandHandler<UploadArticleCoverCommand, Article> {
  private readonly logger = new Logger(UploadArticleCoverHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: UploadArticleCoverCommand): Promise<Article> {
    const { file, id } = command;

    try {
      if (!file) {
        throw new BadRequestException('Image de couverture obligatoire');
      }

      const article = await this.queryBus.execute<FindArticleByIdQuery, Article>(new FindArticleByIdQuery(id));

      if (article.cover) {
        await promises.unlink(join(ARTICLE_UPLOAD_DIR, article.cover)).catch(() => undefined);
      }

      await this.repository.update(id, {
        cover: file.filename
      });

      return await this.queryBus.execute(new FindArticleByIdQuery(id));
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;

      this.logger.error(
        `Upload article cover failed id="${id}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Ajout de l'image de couverture impossible");
    }
  }
}
