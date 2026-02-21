## Context

The post-connection menu view was just introduced (change: `post-connection-menu`). Currently, the menu view uses a vertical `flex flex-col` layout that stacks the device image and connection info above the ActionMenu cards. The templates view, by contrast, uses a horizontal `flex items-center gap-8` layout with the device on the left, an arrow in the middle, and the template list on the right. This inconsistency makes the transition between views feel jarring.

Current menu view structure:
```
┌──────────────────┐
│   Device Image   │
│  "Connected..."  │
│  [Disconnect]    │
│                  │
│  ── Menu Cards ──│
│  [Backup]        │
│  [Restore]       │
│  [Manage]        │
└──────────────────┘
```

Desired layout:
```
┌────────────┐     ┌────────────────┐
│  Device    │     │  [Backup]      │
│  Image     │ ──▶ │  [Restore]     │
│ Connected  │     │  [Manage]      │
│[Disconnect]│     │                │
└────────────┘     └────────────────┘
```

## Goals / Non-Goals

**Goals:**
- Match the menu view layout to the templates view layout (device left, content right)
- Use an arrow separator between device and menu, consistent with the templates view
- Arrange menu action cards in a grid that fits the right-side panel area
- Ensure smooth visual transition when switching between menu and templates views

**Non-Goals:**
- Changing the ActionMenu's functionality or callbacks
- Modifying the templates view layout
- Changing the disconnected view layout
- Adding new actions or features to the menu

## Decisions

### 1. Reuse the same horizontal layout as the templates view

**Decision**: Change the menu view's `<main>` from `flex flex-col items-center justify-center gap-8` to `flex items-center justify-center gap-8`, matching the templates view exactly.

**Rationale**: The device section and disconnect button already exist in both views. Using the same layout class means the device stays in the same position when transitioning between menu and templates views, creating a seamless feel.

### 2. Add the arrow separator to the menu view

**Decision**: Include the same `ArrowRight` separator between the device section and the ActionMenu, identical to the one used between device and TemplateList.

**Rationale**: Visual consistency. The arrow conveys "connected flow" from device to action area.

### 3. Grid layout for action cards

**Decision**: Change ActionMenu's card layout from a vertical stack (`flex flex-col gap-3`) to a CSS grid. With 3 cards, a reasonable arrangement is a 2-column grid where Backup and Restore sit side-by-side on the first row, and Manage Templates spans the full width on the second row (since it's the primary action).

**Alternatives considered**:
- *3-column single row*: Cards would be too narrow to show descriptions comfortably.
- *Keep vertical stack*: Doesn't utilize the side panel area well; feels like a narrow list.
- *2x2 grid with empty cell*: Wastes space, looks unbalanced.

### 4. Manage Templates card gets visual emphasis

**Decision**: The "Manage Templates" card spans the full width of the grid to signal it as the primary action, while Backup and Restore are secondary, equal-sized cards above it.

**Rationale**: Manage Templates is the most common action. Making it wider gives it natural visual weight without adding extra styling.

## Risks / Trade-offs

- **Slightly wider layout**: The menu view will now take more horizontal space. Not a concern since the templates view already uses this width and the app window accommodates it.
- **Card text density**: Grid cards have less horizontal space than the full-width vertical cards. Mitigation: Descriptions are short enough to fit; can test and adjust padding if needed.
