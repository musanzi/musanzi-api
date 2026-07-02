# Tags Integration Guide

Tag response shape:

```ts
{
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

## Create Tag

POST /tags

DTO:

- `CreateTagDto`

```ts
{
  name: string;
}
```

Response:

- `Tag`

Notes:

- Requires `ADMIN` role.
- `name` is required, must be a string, and has a maximum length of `80`.
- Tag names are unique.
- Duplicate names return `409 Conflict`.

## Find Tags

GET /tags

DTO:

- Query params:

```ts
{
  q?: string;
  page?: number | string;
  limit?: number | string;
  take?: number | string;
}
```

Response:

- `[Tag[], number]`

```ts
[
  Tag[],
  totalCount: number
]
```

Notes:

- Public endpoint.
- Results are ordered by `name` ascending.
- `q` filters by tag `name`.
- When query params are provided, pagination defaults to `page = 1` and `limit = 20`.
- `limit` or `take` must be between `1` and `100`.
- Invalid pagination returns `400 Bad Request`.

## Find Tag By Id

GET /tags/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

Response:

- `Tag`

Notes:

- Public endpoint.
- Returns `404 Not Found` when the tag does not exist.

## Update Tag

PATCH /tags/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

- `UpdateTagDto`

```ts
{
  name?: string;
}
```

Response:

- `Tag`

Notes:

- Requires `ADMIN` role.
- `UpdateTagDto` is a partial `CreateTagDto`.
- `name`, when provided, must be a string and has a maximum length of `80`.
- Tag names are unique.
- Duplicate names return `409 Conflict`.
- Returns `404 Not Found` when the tag does not exist.

## Delete Tag

DELETE /tags/:id

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
- Returns `404 Not Found` when the tag does not exist.
