import { Article } from '@/modules/articles/entities/article.entity';
import { AbstractEntity } from '@/shared/abstracts';
import { Column, Entity, ManyToMany } from 'typeorm';

@Entity()
export class Tag extends AbstractEntity {
  @Column({ type: 'varchar', length: 80, unique: true })
  name: string;

  @ManyToMany(() => Article, (article) => article.tags)
  articles: Article[];
}
