import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectLinkDto } from './project-link.dto';

export class CreateProjectDto {
  @IsNotEmpty({ message: 'Le nom du projet est obligatoire' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Le résumé du projet est obligatoire' })
  @IsString()
  summary: string;

  @IsOptional()
  @IsString()
  image?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectLinkDto)
  links?: ProjectLinkDto[];
}
