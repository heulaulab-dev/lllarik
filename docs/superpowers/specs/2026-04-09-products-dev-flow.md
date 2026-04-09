# Products Developer Flow

## Scope

Technical reference for products module media flow with backward-compatible API behavior.

## Data Contract

Draft product payload now supports both:

- `images: string[]` (ordered media list, preferred)
- `imageUrl: string` (primary compatibility field)

Compatibility behavior:

1. If `images` exists and has at least one item:
   - backend stores full `images`
   - backend sets `imageUrl = images[0]`
2. If `images` is empty or omitted:
   - backend accepts legacy `imageUrl`
   - backend persists empty `images`

## Upload Sequence (Direct to Storage)

For each selected file:

1. `POST /api/v1/storage/presign-upload`
2. Browser `PUT` file to returned `uploadUrl`
3. Take `publicUrl` from response
4. Append `publicUrl` to `images[]`
5. Keep `imageUrl = images[0]`
6. Submit product draft create/update request

## Frontend State Rules

- Upload state per file: `uploading | success | failed`
- Disable save action while any upload is `uploading`
- Remove image action updates both preview cards and `images[]`
- Set primary action reorders `images[]` and recomputes `imageUrl`

## API Scenarios

### New client payload

```json
{
  "slug": "solen",
  "name": "Solen",
  "images": [
    "https://cdn.example/solen-1.jpg",
    "https://cdn.example/solen-2.jpg"
  ],
  "imageUrl": "https://cdn.example/solen-1.jpg"
}
```

### Legacy payload

```json
{
  "slug": "aven",
  "name": "Aven",
  "imageUrl": "https://cdn.example/aven-primary.jpg"
}
```

## Regression Checklist

Backend:
- create draft accepts `images[]` and sets `imageUrl` from first item
- legacy `imageUrl` payload still accepted
- update draft image reorder updates primary image correctly

Frontend:
- tag badge add/remove and dedupe behavior works
- image upload success/failure states render correctly
- Set Primary updates payload ordering
- save remains disabled while uploading

## Verification Commands

Backend:

```bash
cd lllarik-api
go test ./... -count=1
```

Frontend:

```bash
cd lllarik
npm test
npm run lint
npx tsc --noEmit
```
