import { AbstractEntity } from '@/shared/abstracts';
import { Column, Entity } from 'typeorm';
import { IProjectLink } from '../interfaces';

@Entity()
export class Project extends AbstractEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'varchar', nullable: true })
  image: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  links: IProjectLink[];
}
