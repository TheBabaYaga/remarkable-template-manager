## Why

The post-connection action menu currently renders in a vertical stack below the device image and disconnect button, making it feel disconnected from the main workspace area. The templates view already uses a side-by-side layout (device + arrow + template list), and the menu should follow the same pattern so the transition between menu and templates views feels consistent and cohesive.

## What Changes

- Reposition the ActionMenu from a vertical stack below the device to a side-by-side layout next to the device image (matching the templates view's horizontal arrangement)
- Update the ActionMenu component to use a grid-style card layout instead of a vertical list of cards
- Keep the device section (image, connection status, disconnect button) on the left, with the action menu on the right — mirroring how the template list appears in the templates view

## Capabilities

### New Capabilities

### Modified Capabilities
- `post-connection-menu`: The action menu layout changes from a vertically stacked column below the device to a horizontal grid positioned beside the device, consistent with the templates view layout

## Impact

- **Frontend**: `Index.tsx` menu view layout changes from `flex flex-col` to a horizontal `flex` layout with the device on the left and ActionMenu on the right. `ActionMenu.tsx` component updated to use a grid card layout instead of a vertical card list.
- **No backend changes**: Purely a layout/styling change.
- **No breaking changes**: Same functionality, different visual arrangement.
