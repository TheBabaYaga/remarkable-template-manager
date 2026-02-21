## MODIFIED Requirements

### Requirement: Action menu displayed after connection
The system SHALL display an action menu screen immediately after a successful SSH connection to the reMarkable device, before any other workflow begins. The action menu SHALL be positioned in a side-by-side horizontal layout with the device information on the left and the action cards on the right, separated by a directional arrow, consistent with the template management view layout.

#### Scenario: Successful connection shows menu in horizontal layout
- **WHEN** the user successfully connects to the reMarkable device via SSH
- **THEN** the system displays the device image and connection info on the left
- **AND** displays a directional arrow separator in the middle
- **AND** displays the action menu cards on the right in a grid layout
- **AND** the system does NOT automatically fetch templates from the device

#### Scenario: Quick connect shows menu in horizontal layout
- **WHEN** the user connects via the quick connect button using saved config
- **THEN** the system displays the action menu in the same horizontal layout

#### Scenario: Menu and template views share consistent layout
- **WHEN** the user switches between the action menu view and the template management view
- **THEN** the device section remains in the same position on the left
- **AND** the right-side content area transitions between the action menu grid and the template list

## ADDED Requirements

### Requirement: Action menu grid layout
The action menu SHALL display its action cards in a grid layout. Backup and Restore SHALL appear as equally-sized cards in the first row, and Manage Templates SHALL span the full width of the grid in the second row.

#### Scenario: Grid arrangement of action cards
- **WHEN** the action menu is displayed
- **THEN** the Backup and Restore cards appear side-by-side in the first row
- **AND** the Manage Templates card appears below, spanning the full width

#### Scenario: Action cards remain functional
- **WHEN** the user clicks any action card in the grid layout
- **THEN** the corresponding action is triggered (backup, restore, or manage templates)
