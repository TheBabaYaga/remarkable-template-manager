## 1. Merge pending sections in TemplateList

- [x] 1.1 Move deletion-pending template rendering to directly after unsynced templates (before the "On Device" divider)
- [x] 1.2 Remove the "Pending Deletion" divider and its surrounding conditional block
- [x] 1.3 Update the "On Device" divider condition to show when any pending changes (uploads OR deletions) exist AND synced templates exist

## 2. Fix animation delays

- [x] 2.1 Update the animation delay index for deletion-pending templates to follow sequentially after unsynced templates (instead of after synced templates)

## 3. Verify

- [x] 3.1 Run frontend lint and tests to confirm no regressions
