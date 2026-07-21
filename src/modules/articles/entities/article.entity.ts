import { AbstractEntity } from '@/shared/abstracts';
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

  @Column({ type: 'timestamptz' })
  publishedAt: Date;

  @Column({ type: 'int', default: 0 })
  viewsCount: number;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb", select: false })
  viewHllRegisters: number[];

  @ManyToMany(() => Tag, (tag) => tag.articles)
  @JoinTable({ name: 'article_tags' })
  tags: Tag[];
}
