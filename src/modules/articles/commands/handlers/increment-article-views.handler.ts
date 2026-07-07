import { Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../../entities/article.entity';
import { addHyperLogLogValue } from '../../helpers';
import { IncrementArticleViewsCommand } from '../impl';

@CommandHandler(IncrementArticleViewsCommand)
export class IncrementArticleViewsHandler implements ICommandHandler<IncrementArticleViewsCommand, void> {
  private readonly logger = new Logger(IncrementArticleViewsHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>
  ) {}

  async execute(command: IncrementArticleViewsCommand): Promise<void> {
    try {
      await this.repository.manager.transaction(async (manager) => {
        const articleRepository = manager.getRepository(Article);
        const article = await articleRepository
          .createQueryBuilder('article')
          .addSelect('article.viewHllRegisters')
          .setLock('pessimistic_write')
          .where('article.slug = :slug', { slug: command.slug })
          .andWhere('article.publishedAt IS NOT NULL')
          .getOne();

        if (!article) {
          throw new NotFoundException('Article introuvable');
        }

        const [viewHllRegisters, viewsCount] = addHyperLogLogValue(article.viewHllRegisters, command.viewerFingerprint);

        await articleRepository.update(article.id, { viewHllRegisters, viewsCount });
      });
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        `Increment article views failed slug="${command.slug}": ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      throw error;
    }
  }
}
