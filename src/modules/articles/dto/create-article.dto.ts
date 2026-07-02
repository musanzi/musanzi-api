import { IsArray, IsBoolean, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ArticleContentFormat } from '../interfaces';

export class CreateArticleDto {
  @IsNotEmpty({ message: "Le titre de l'article est obligatoire" })
  @IsString()
  title: string;

  @IsNotEmpty({ message: "Le résumé de l'article est obligatoire" })
  @IsString()
  summary: string;

  @IsNotEmpty({ message: "Le contenu de l'article est obligatoire" })
  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['mdx'])
  contentFormat?: ArticleContentFormat;

  @IsOptional()
  @IsString()
  cover?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsDateString()
  publishedAt?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
