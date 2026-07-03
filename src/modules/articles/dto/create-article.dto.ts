import { IsArray, IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

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
