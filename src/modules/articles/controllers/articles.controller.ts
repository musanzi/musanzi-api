import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { Public, HasRoles } from '@/modules/auth/decorators';
import { Roles } from '@/modules/auth/enums';
import { AbstractController } from '@/shared/abstracts';
import { createDiskUploadOptions } from '@/shared/helpers';
import {
  CreateArticle,
  DeleteArticle,
  IncrementArticleViews,
  UpdateArticle,
  UploadArticleCover
} from '../commands';
import { CreateArticleDto, UpdateArticleDto } from '../dto';
import { Article } from '../entities/article.entity';
import { createArticleViewFingerprint } from '../helpers';
import { IFilterArticles } from '../interfaces';
import { FindArticleById, FindArticleBySlug, FindArticles } from '../queries';

@Controller('articles')
export class ArticlesController extends AbstractController {
  @Post()
  @HasRoles([Roles.ADMIN])
  create(@Body() dto: CreateArticleDto): Promise<Article> {
    return this.commandBus.execute(new CreateArticle(dto));
  }

  @Get()
  @Public()
  findAll(@Query() query: IFilterArticles): Promise<[Article[], number]> {
    return this.queryBus.execute(new FindArticles(query));
  }

  @Get('admin')
  @HasRoles([Roles.ADMIN])
  findAllAdmin(@Query() query: IFilterArticles): Promise<[Article[], number]> {
    return this.queryBus.execute(new FindArticles(query, true));
  }

  @Get('admin/:id')
  @HasRoles([Roles.ADMIN])
  findOneAdmin(@Param('id') id: string): Promise<Article> {
    return this.queryBus.execute(new FindArticleById(id, true));
  }

  @Get(':slug')
  @Public()
  async findOne(@Param('slug') slug: string, @Req() request: Request): Promise<Article> {
    await this.commandBus.execute(new IncrementArticleViews(slug, createArticleViewFingerprint(request)));
    return this.queryBus.execute(new FindArticleBySlug(slug));
  }

  @Patch(':id')
  @HasRoles([Roles.ADMIN])
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto): Promise<Article> {
    return this.commandBus.execute(new UpdateArticle(id, dto));
  }

  @Post(':id/cover')
  @HasRoles([Roles.ADMIN])
  @UseInterceptors(FileInterceptor('cover', createDiskUploadOptions('./uploads/articles')))
  uploadCover(@Param('id') id: string, @UploadedFile() file: Express.Multer.File): Promise<Article> {
    return this.commandBus.execute(new UploadArticleCover(id, file));
  }

  @Delete(':id')
  @HasRoles([Roles.ADMIN])
  remove(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteArticle(id));
  }
}
