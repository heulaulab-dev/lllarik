# Products Admin Flow

## Purpose

This guide explains the operational flow for content admins to create, edit, and publish products using the dashboard products module.

## 1) Open Products Dashboard

1. Sign in through `/dashboard/login`.
2. Open `/dashboard/products`.
3. Existing draft rows appear on the left table.

## 2) Create or Edit a Draft

- **Create:** fill form fields on the right panel.
- **Edit:** click an existing row in the draft table to load it into the form.

Required fields for save:
- `Name`
- `Slug`

## 3) Manage Tags with Badges

1. Enter a tag in the **Add tag** input.
2. Press **Enter** or click **Add**.
3. Tag appears as a badge chip.
4. Click a badge to remove it.

Notes:
- Duplicate tags are ignored.
- Whitespace around tags is trimmed automatically.

## 4) Upload Multiple Images

1. Use the **Images** file picker (supports multi-select).
2. Each file uploads directly to storage.
3. Uploaded images appear in preview cards with status badge.

Status meanings:
- `uploading`: transfer still in progress
- `success`: uploaded and included in product payload
- `failed`: upload failed (remove or re-upload)

## 5) Set Primary Image

- Click **Set Primary** on any uploaded image.
- Primary image becomes the first image in ordered media list.
- Primary image is also used as `imageUrl` for compatibility.

## 6) Save Draft

1. Click **Create Draft Product** (new draft) or **Save Draft Changes** (edit mode).
2. Save is disabled while image upload is still running.
3. Use **Clear Form** to reset current draft editing state.

## 7) Publish Flow

1. Open dashboard publish flow.
2. Publish current draft content.
3. Confirm release succeeds.

## 8) Verify on Landing

After publish:
1. Reload landing page.
2. Confirm product content changed as expected.
3. Confirm product uses the selected primary image.

## 9) Troubleshooting

- **Upload failed**
  - Remove failed image card.
  - Re-select file and upload again.
- **No image preview**
  - Verify browser did not block local file access.
  - Retry file selection.
- **Save button disabled**
  - Wait for uploads to finish.
  - Ensure Name and Slug are filled.
- **Unexpected published image**
  - Reopen draft and set the correct primary image.
  - Save and publish again.
