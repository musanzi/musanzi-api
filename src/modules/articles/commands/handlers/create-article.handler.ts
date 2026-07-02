import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Article } from '../../entities/article.entity';
import { createArticleSlug } from '../../helpers/article-slug.helper';
import { CreateArticleCommand } from '../impl';

@CommandHandler(CreateArticleCommand)
export class CreateArticleHandler implements ICommandHandler<CreateArticleCommand, Article> {
  private readonly logger = new Logger(CreateArticleHandler.name);

  constructor(
    @InjectRepository(Article)
    private readonly repository: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>
  ) {}

  async execute(command: CreateArticleCommand): Promise<Article> {
    const { dto } = command;

    try {
      const tags = await this.findTags(dto.tagIds ?? []);
      const published = dto.published ?? false;

      return await this.repository.save(
        this.repository.create({
          title: dto.title,
          slug: await this.createUniqueSlug(dto.title),
          summary: dto.summary,
          content: dto.content,
          contentFormat: dto.contentFormat ?? 'mdx',
          cover: dto.cover ?? null,
          published,
          publishedAt: published ? this.resolvePublishedAt(dto.publishedAt) : null,
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

  private async findTags(tagIds: string[]): Promise<Tag[]> {
    if (tagIds.length === 0) return [];

    const tags = await this.tagRepository.find({
      where: { id: In(tagIds) }
    });

    if (tags.length !== new Set(tagIds).size) {
      throw new BadRequestException('Un ou plusieurs tags sont introuvables');
    }

    return tags;
  }

  private async createUniqueSlug(title: string): Promise<string> {
    const baseSlug = createArticleSlug(title) || 'article';
    let slug = baseSlug;
    let suffix = 2;

    while (await this.repository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private resolvePublishedAt(publishedAt?: string | null): Date {
    return publishedAt ? new Date(publishedAt) : new Date();
  }
}
