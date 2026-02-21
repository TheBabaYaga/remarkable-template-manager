## Context

The `TemplateList` component currently renders three separate sections with dividers:

1. **Top**: Pending uploads (amber styling, `unsyncedTemplates`)
2. **Middle**: On-device templates (synced, with checkboxes for selection)
3. **Bottom**: Pending deletions (red styling, `deletionPendingTemplates`) below a "Pending Deletion" divider

Both pending uploads and pending deletions represent uncommitted changes that are applied together via the Sync button. Visually separating them into different sections creates unnecessary cognitive distance.

## Goals / Non-Goals

**Goals:**
- Merge pending uploads and pending deletions into a single section above the "On Device" divider
- Maintain existing visual styling (amber for uploads, red/crossed-out for deletions)
- Keep the existing divider between pending changes and on-device templates

**Non-Goals:**
- Changing the sync behavior or data model
- Modifying how pending uploads or deletions are styled individually
- Adding new UI interactions or state management

## Decisions

**1. Section ordering within the merged pending area: uploads first, then deletions**

Uploads appear first because they represent new content being added, which is the more common action. Deletions follow, maintaining a natural "add then remove" mental model. Both sit above the "On Device" divider.

Alternative considered: interleaving by timestamp — rejected as over-engineering for this scope and no timestamps exist on these actions.

**2. Rename the "On Device" divider condition but keep the label**

The "On Device" divider currently shows when there are unsynced templates AND (synced or deletion-pending templates). After the merge, it should show when there are ANY pending changes (uploads or deletions) AND synced templates exist. The label "On Device" remains appropriate.

**3. Remove the "Pending Deletion" divider entirely**

The separate "Pending Deletion" divider and its section are eliminated. Deletion-pending templates render directly after unsynced templates in the merged pending section.

## Risks / Trade-offs

**[Longer pending section]** → If a user has many pending uploads and deletions, the combined section may be long. This is acceptable because the ScrollArea handles overflow, and grouping related items together is more intuitive than splitting them.

**[No divider between upload types]** → There's no sub-divider between uploads and deletions within the merged section. The color coding (amber vs red) provides sufficient visual distinction. Adding a sub-divider would defeat the purpose of merging.
