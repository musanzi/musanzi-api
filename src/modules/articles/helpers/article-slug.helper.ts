import slugify from 'slugify';

export function createArticleSlug(title: string): string {
  return slugify(title, {
    lower: true,
    strict: true,
    trim: true
  });
}
