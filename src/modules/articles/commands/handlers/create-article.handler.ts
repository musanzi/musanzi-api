import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindTagsByIdsQuery } from '@/modules/tags/queries';
import { Article } from '../../entities/article.entity';
import { CreateArticleCommand } from '../impl';

@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand, Article> {
  private readonly logger = new Logger(CreateArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    private readonly queryBus: QueryBus
  ) {}

  async execute(command: CreateArticleCommand): Promise<Article> {
    const { dto } = command;
    const { tagIds, ...articleDto } = dto;

    try {
      const tags = await this.queryBus.execute(new FindTagsByIdsQuery(tagIds ?? []));

      return await this.repository.save(
        this.repository.create({
          ...articleDto,
          publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : new Date(),
          tags
        })
      );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;

      this.logger.error(
        `Create article failed title="${dto.title}": ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Création de l'article impossible");
    }
  }
}
