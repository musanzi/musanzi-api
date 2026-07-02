# Projects Integration Guide

Project response shape:

```ts
{
  id: string;
  name: string;
  summary: string;
  image: string | null;
  links: Array<{
    label: string;
    href: string;
  }>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

## Create Project

POST /projects

DTO:

- `CreateProjectDto`

```ts
{
  name: string;
  summary: string;
  image?: string | null;
  links?: Array<{
    label: string;
    href: string;
  }>;
}
```

Response:

- `Project`

Notes:

- Requires `ADMIN` role.
- `name` and `summary` are required strings.
- `links[].href` must be a valid URL with protocol.
- Missing `image` is stored as `null`.
- Missing `links` is stored as an empty array.

## Find Projects

GET /projects

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

- `[Project[], number]`

```ts
[
  Project[],
  totalCount: number
]
```

Notes:

- Public endpoint.
- Results are ordered by `updatedAt` descending.
- `q` filters by project `name` or `summary`.
- When query params are provided, pagination defaults to `page = 1` and `limit = 20`.
- `limit` or `take` must be between `1` and `100`.
- Invalid pagination returns `400 Bad Request`.

## Find Project By Id

GET /projects/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

Response:

- `Project`

Notes:

- Public endpoint.
- Returns `404 Not Found` when the project does not exist.

## Update Project

PATCH /projects/:id

DTO:

- Path params:

```ts
{
  id: string;
}
```

- `UpdateProjectDto`

```ts
{
  name?: string;
  summary?: string;
  image?: string | null;
  links?: Array<{
    label: string;
    href: string;
  }>;
}
```

Response:

- `Project`

Notes:

- Requires `ADMIN` role.
- `UpdateProjectDto` is a partial `CreateProjectDto`.
- `links[].href` must be a valid URL with protocol when provided.
- Returns `404 Not Found` when the project does not exist.

## Upload Project Image

POST /projects/:id/image

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
  image: File;
}
```

Response:

- `Project`

Notes:

- Requires `ADMIN` role.
- The uploaded file field name must be `image`.
- Files are stored in `./uploads/projects`.
- The project `image` field is updated with the uploaded filename.
- Replacing an existing image attempts to delete the previous file.
- Missing file returns `400 Bad Request`.
- Returns `404 Not Found` when the project does not exist.

## Delete Project

DELETE /projects/:id

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
- Returns `404 Not Found` when the project does not exist.
