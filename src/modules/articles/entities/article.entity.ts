import { AbstractEntity } from '@/modules/database/abstract.entity';
import { Tag } from '@/modules/tags/entities/tag.entity';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';

@Entity()
export class Article extends AbstractEntity {
  @Column({ type: 'varchar', length: 180 })
  title: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', select: false })
  content: string;

  @Column({ type: 'varchar', nullable: true })
  cover: string | null;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @ManyToMany(() => Tag, (tag) => tag.articles)
  @JoinTable({ name: 'article_tags' })
  tags: Tag[];
}
