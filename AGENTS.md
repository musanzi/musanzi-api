## Module

### General

When creating a feature, use the CQRS pattern:

- Use `queries` for read operations.
- Use `commands` for write operations.
- Use `events` only when needed for side effects or domain events.
- Use the barrel export pattern.

Make sure you fully understand before you get started; if you need clarification, feel free to ask me questions as often as you like one at a time and don't generate migrations and

### Folder structure

- `queries` for queries with subfolders: `handlers`, `impl`, and `tests`
- `commands` for commands with subfolders: `handlers`, `impl`, and `tests`
- `events` for events with subfolders: `handlers`, `impl`, and `tests`
- `controllers` for controllers
- `interfaces` for shared types. Do not define types directly in controllers, queries, commands, or events.
- `helpers` for reusable helpers across the module
- `dto` for DTOs
- `entities` for entities

### Integration documentation

For every new feature, create:

```txt
INTEGRATION_<FEATURE_NAME>.md
```

The file must document each exposed endpoint with:

```md
## <Action name>

METHOD /path

DTO:

- request DTO name or shape

Response:

- response shape

Keep this file updated whenever the API changes.
```
