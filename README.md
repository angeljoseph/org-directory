# Organisation Directory

A small Angular 19 screen for finding organisations, checking their status and adding a new one.

- Live app: _paste your link here_
- Decisions and trade-offs: see [DECISIONS.md](./DECISIONS.md)

## Run it

```bash
npm install
ng serve
```

Open http://localhost:4200. The list takes about a minute to load fully, because the mock API allows only 5 requests per minute.

## Where things are

- `public/organisations.json`: the data (137 records, deliberately messy)
- `generate-fixture.mjs`: script that built the data file. Run `node generate-fixture.mjs` to rebuild it.
- `src/app/core/org-api.service.ts`: mock API (delay, ~15% failures, 25 per page, 5 requests per minute)
- `src/app/orgs/org.mapper.ts`: turns raw records into clean ones
- `src/app/orgs/org-list/`: the list, sorting, search and filter
- `src/app/orgs/org-create-form/`: the create form
- `src/app/i18n/en.json`: every visible string
- `src/styles.css`: design tokens (colours, spacing, sizes)
