## Why

The template management screen separates pending uploads (top) and pending deletions (bottom) into distinct sections with a divider between them. Since both represent uncommitted changes that will be applied on sync, they should be displayed together in a single "Pending Changes" section. The visual styling (amber for uploads, red/crossed-out for deletions) already distinguishes them clearly.

## What Changes

- Merge pending uploads and pending deletions into a single "Pending Changes" section above the "On Device" divider
- Remove the separate "Pending Deletion" divider and bottom section
- Pending deletions appear alongside pending uploads, maintaining their existing red/crossed-out styling
- Ordering within the merged section: pending uploads first, then pending deletions

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None. This is a UI layout change within the existing `TemplateList` component — no spec-level behavior changes.

## Impact

- `frontend/src/components/TemplateList.tsx`: Restructure the template list rendering to combine unsynced and deletion-pending templates into one section, remove the "Pending Deletion" divider
- No backend changes
- No data model changes
- No changes to sync behavior
