import { IProjectLink } from './project-link.interface';

export interface IProject {
  name: string;
  summary: string;
  image?: string | null;
  links: IProjectLink[];
}
