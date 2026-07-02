# Articles Integration Guide

Article response shape:

```ts
{
  id: string;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  contentFormat: 'mdx';
  cover: string | null;
  published: boolean;
  publishedAt: string | null;
  tags: Array<{
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

## Create Article

POST /articles

DTO:

- `CreateArticleDto`

```ts
{
  title: string;
  summary: string;
  content: string;
  contentFormat?: 'mdx';
  cover?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  tagIds?: string[];
}
```

Response:

- `Article`

Notes:

- Requires `ADMIN` role.
- `title`, `summary`, and `content` are required strings.
- `contentFormat`, when provided, must be `mdx`; otherwise it defaults to `mdx`.
- `cover` defaults to `null`.
- `published` defaults to `false`.
- When `published` is `true`, `publishedAt` defaults to the current date if omitted.
- When `published` is `false` or omitted, `publishedAt` is stored as `null`.
- `tagIds` must contain UUID v4 values.
- If any tag id does not exist, returns `400 Bad Request`.
- The article `slug` is generated from `title` and made unique automatically.

## Find Published Articles

GET /articles

DTO:

- Query params:

```ts
{
  q?: string;
  tagId?: string;
  status?: 'all' | 'draft' | 'published';
  page?: number | string;
  limit?: number | string;
  take?: number | string;
}
```

Response:

- `[Article[], number]`

```ts
[
  Article[],
  totalCount: number
]
```

Notes:

- Public endpoint.
- Returns published articles only.
- `content` is not included in list responses.
- Results are ordered by `publishedAt` descending with nulls last, then `updatedAt` descending.
- `q` filters by article `title`, `summary`, or `content`.
- `tagId` filters by attached tag id.
- `status` is ignored on this public endpoint because unpublished articles are excluded.
- When query params are provided, pagination defaults to `page = 1` and `limit = 20`.
- `limit` or `take` must be between `1` and `100`.
- Invalid pagination returns `400 Bad Request`.

## Find Articles For Admin

GET /articles/admin

DTO:

- Query params:

```ts
{
  q?: string;
  tagId?: string;
  status?: 'all' | 'draft' | 'published';
  page?: number | string;
  limit?: number | string;
  take?: number | string;
}
```

Response:

- `[Article[], number]`

```ts
[
  Article[],
  totalCount: number
]
```

Notes:

- Requires `ADMIN` role.
- Includes published and unpublished articles by default.
- `content` is not included in list responses.
- `status = draft` returns unpublished articles.
- `status = published` returns published articles.
- `status = all` or omitted returns both published and unpublished articles.
- `q` filters by article `title`, `summary`, or `content`.
- `tagId` filters by attached tag id.
- Results are ordered by `publishedAt` descending with nulls last, then `updatedAt` descending.
- When query params are provided, pagination defaults to `page = 1` and `limit = 20`.
- `limit` or `take` must be between `1` and `100`.
- Invalid pagination returns `400 Bad Request`.

## Find Article By Id For Admin

GET /articles/admin/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

Response:

- `Article`

Notes:

- Requires `ADMIN` role.
- Includes `content`.
- Can return published or unpublished articles.
- Returns `404 Not Found` when the article does not exist.

## Find Published Article By Slug

GET /articles/:slug

DTO:

- Path params:

```ts
{
  slug: string;
}
```

Response:

- `Article`

Notes:

- Public endpoint.
- Includes `content`.
- Returns published articles only.
- Returns `404 Not Found` when the article does not exist or is unpublished.

## Update Article

PATCH /articles/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

- `UpdateArticleDto`

```ts
{
  title?: string;
  summary?: string;
  content?: string;
  contentFormat?: 'mdx';
  cover?: string | null;
  published?: boolean;
  publishedAt?: string | null;
  tagIds?: string[];
}
```

Response:

- `Article`

Notes:

- Requires `ADMIN` role.
- `UpdateArticleDto` is a partial `CreateArticleDto`.
- `contentFormat`, when provided, must be `mdx`.
- `publishedAt` must be an ISO date string when provided with a value.
- `published = false` clears `publishedAt`.
- `published = true` sets `publishedAt` to the current date when the article does not already have one and `publishedAt` is omitted.
- `publishedAt = null` clears `publishedAt`.
- `tagIds` replaces the article tags; an empty array removes all tags.
- If any tag id does not exist, returns `400 Bad Request`.
- Updating `title` does not regenerate `slug`.
- Returns `404 Not Found` when the article does not exist.

## Upload Article Cover

POST /articles/:id/cover

DTO:

- Path params:

```ts
{
  id: string;
}
```

- Multipart form data:

```ts
{
  cover: File;
}
```

Response:

- `Article`

Notes:

- Requires `ADMIN` role.
- The uploaded file field name must be `cover`.
- Files are stored in `./uploads/articles`.
- The article `cover` field is updated with the uploaded filename.
- Replacing an existing cover attempts to delete the previous file.
- Missing file returns `400 Bad Request`.
- Returns `404 Not Found` when the article does not exist.

## Delete Article

DELETE /articles/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

Response:

- `void`

Notes:

- Requires `ADMIN` role.
- Returns `404 Not Found` when the article does not exist.
