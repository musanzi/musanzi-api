import { IsString, IsUrl } from 'class-validator';

export class ProjectLinkDto {
  @IsString()
  label: string;

  @IsUrl({ require_protocol: true })
  href: string;
}
