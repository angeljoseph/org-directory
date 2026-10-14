# DECISIONS

Short notes on what I chose, what I rejected, and why.

## Conflict 1: "show everything on one page" vs. 25 records per request, 5 requests per minute

- **Chose:** one continuous list with no page buttons. The app fetches pages one after another in the background and adds rows as each page arrives. A line above the table shows "Loaded 100 of 137".
- **Rate limit:** 137 records at 25 per page is 6 requests, and only 5 are allowed per minute, so the last page cannot load straight away. When the API answers "rate limited", the app shows a message, waits 5 seconds and tries again. All 137 rows appear after roughly a minute.
- **Random failures:** a failed request is retried up to 3 times. If a page still fails, the rows already loaded stay on screen and a "Try again" button continues from the failed page.
- **Rejected:** pagination (ops asked for one page). Also rejected: showing nothing until all 137 rows are ready, because the user would stare at a spinner for a minute.
- **Gave up:** the full list is not available instantly. Search, filter and sort only cover the rows that have arrived, so a search can miss records that are still loading. The progress line makes this visible.
- **Would improve:** wait exactly until the oldest request leaves the 60-second window instead of polling every 5 seconds.

## Conflict 2: "status as a coloured dot only" vs. "never convey information by colour alone"

- **Chose:** a small dot plus a visible text label ("Active", "Suspended", and so on). The dot is also a different shape for each status: filled circle, hollow circle, filled square, half-filled circle, hollow square. The dot is hidden from screen readers because the label already says it.
- **Rejected:** dot only (fails the accessibility rule). Also rejected: dot with a tooltip, because tooltips don't work on touch screens or for keyboard users.
- **Gave up:** some of the designer's minimal look. I kept the dot small and the label in normal text colour to keep the table clean.

## Messy data

- **Where it is handled:** one mapper function (`org.mapper.ts`) turns every raw record into a clean `Organisation`. Components never see raw data.
- **Status:** trimmed and lowercased, so `ACTIVE` and `Active` match. Anything not recognised (`actve`, `null`) becomes "Unknown". I did not guess that `actve` means `active`, because a wrong guess shows wrong data. "Unknown" is also a filter option, so ops can find these records.
- **Names:** empty or `null` shows "Unnamed organisation". Very long names are cut with "…" and the full name shows on hover. Arabic names use `dir="auto"` so they read right to left.
- **Member count:** `"12"` becomes 12. Negative, empty, fractional or non-numeric values become "—". I used `null`, not 0, because "0 members" and "unknown" are different things.
- **Dates:** ISO strings, epoch numbers and epoch strings are accepted. `"not a date"` becomes "—" and sorts last. I only accept ISO-shaped strings, because other formats parse differently in different browsers.
- **Owner:** the owner object can be missing. A missing or invalid email shows "—".
- **Duplicate `id` (42 appears twice, with different names):** the `id` cannot be used as the row key. Each row gets its own key (page and position).
- **Messiest thing:** the duplicate id 42. Two different organisations share one id, and one of them also has the misspelled status `actve`.

## Other decisions

- **Stack:** Angular 19, standalone components, signals for state, `@if` / `@for`, `inject()`, typed non-nullable reactive forms, TypeScript strict mode.
- **Search and filter:** both live in the URL (`?q=...&status=...`). The URL is the single source of truth, so shared links, refresh and the Back button work. Search waits 300 ms after typing stops. The URL uses `replaceUrl`, so typing does not fill the browser history.
- **Sorting:** by name and by created date. Rows with no name or date always go last, in both directions. Sort is not stored in the URL because the brief only asks for search and filter.
- **Create form:** name is required, 3 to 80 characters (spaces at the ends are ignored), and must be unique ignoring case. Status and owner email are required. Member count is optional and must be a whole number of 0 or more. Errors appear after the user leaves a field. Pressing Create with errors shows a summary and moves focus to the first bad field, so the button is not the only signal. The button is never disabled, because a disabled button can't explain what is wrong.
- **Email rule:** the form and the mapper use the same pattern, so a created row never shows "—" for an email the form accepted.
- **States:** loading (grey box), empty (dashed box), error (red box with retry) look different from each other.
- **Strings:** every visible string is in `en.json`. Translation keys are typed, so a typo is a build error.
- **Tokens:** all colours, spacing, sizes and radii are CSS custom properties in `styles.css`. Changing `--color-brand` changes the brand colour in one place.
- **Fixture:** a script (`generate-fixture.mjs`, seeded so the output is always the same) builds 137 records from the 8 given ones and keeps their quirks. The emoji in the Arabic name was lost when the brief was copied, so I used a different one.

## Assumptions

- Create works in the browser only (no backend). New organisations disappear on refresh.
- The uniqueness check only knows about rows that have loaded or been created. A real API would check on the server.
- The rate limit and failures are simulated in the mock API service, not on a real server.
- There is one language (English). The structure allows adding more.

## With two more days

- A "data quality" view that lists records with unknown status, missing names or bad dates, so ops can fix them at the source.
- Exact rate-limit waiting, and stop loading when the user leaves the page.
- Sort in the URL, a "clear filters" button, and tests for the mapper and the create form.

## AI tools declaration

> TODO before sending: read this section and change anything that is not true for you.

- I used Claude (an AI assistant from Anthropic) throughout this task.
- **Where:** project plan, the fixture generator script, the mock API service, the mapper, the list component, sorting, search and filter, the create form, the status dot and the accessibility checks. It also helped me write this file.
- **What I did myself:** ran every step in the browser and fixed errors, chose the resolutions for both conflicts, and committed the work in small steps.
- I can explain every file, and I am ready to add a small feature live without AI help.
