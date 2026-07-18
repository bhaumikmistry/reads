# Reads

Articles and blogs tracked via GitHub Issues.

## How to use

- **Add**: Open an issue. Title = article name. Body = URL.
- **Mark read**: Close the issue.
- **Apple Shortcut**: Share sheet → creates issue automatically.

## Manual test

```bash
gh issue create --repo bhaumikmistry/reads --title "Article Title" --body "https://example.com/article"
```

## API

`api.json` contains all entries:
```json
{ "id": 1, "title": "...", "url": "https://...", "state": "to-read", "createdAt": "..." }
```
