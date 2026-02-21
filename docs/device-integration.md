# Device Integration

Details on how the application interacts with the reMarkable tablet over SSH.

## SSH Connection

| Setting | Value |
|---------|-------|
| **Default IP** | `10.11.99.1` (USB connection) |
| **Port** | 22 |
| **User** | `root` |
| **Auth** | Public key (RSA 4096-bit) |
| **Timeout** | 10 seconds |

### Key Management

- Keys are listed from `~/.ssh/` by scanning for files containing `PRIVATE KEY` headers
- Generated keys use the naming format `remarkable_<16-char-hex-id>` (e.g., `remarkable_a1b2c3d4e5f6g7h8`)
- Key upload uses one-time password authentication to append the public key to the device's `~/.ssh/authorized_keys`
- Private keys stay in `~/.ssh/` and are never copied or moved

### Connection Lifecycle

1. **Connect**: Establish SSH session with key auth
2. **Remount**: Automatically run `mount -o remount,rw /` to enable writes to the root filesystem
3. **Monitor**: Frontend polls `CheckConnection()` every 10 seconds (runs `echo ok` over SSH)
4. **Disconnect**: Close SSH client, clear connection state

### reMarkable Pro

Developer Mode must be enabled for SSH access. Enabling Developer Mode **factory resets the device** — back up notes first (via reMarkable Connect cloud sync or USB transfer).

## Filesystem Layout

All template data lives under `/usr/share/remarkable/templates/` on the device:

```
/usr/share/remarkable/templates/
├── templates.json          # Template metadata (name, filename, icon, categories)
├── template-one.png        # Template image files
├── template-two.svg
└── ...
```

The root filesystem is mounted read-only by default. The app remounts it read-write after connecting (`mount -o remount,rw /`).

### templates.json Structure

```json
{
  "templates": [
    {
      "name": "Blank",
      "filename": "Blank",
      "iconCode": "\ue9fe",
      "landscape": false,
      "categories": ["Creative", "Lines", "Grids", "Planners"]
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name shown in the reMarkable UI |
| `filename` | string | Filename without extension (matches a `.png` or `.svg` file in the templates directory) |
| `iconCode` | string | Unicode icon code for the template picker |
| `landscape` | bool | Whether the template is landscape-oriented (omitted if `false`) |
| `categories` | string[] | Categories the template appears under in the device UI |

### Sync Behavior

When syncing templates:
- New template files are uploaded via SSH stdin pipe (`cat > /path/to/file`)
- `templates.json` is read, modified in memory, and written back
- Deleted templates are removed from `templates.json` only — the image files remain on disk
- A device reboot is required for changes to appear in the reMarkable UI

### Backup & Restore

**Backup**: The entire `/usr/share/remarkable/templates/` directory is downloaded recursively, then compressed into a local ZIP file (`remarkable-templates-backup-YYYYMMDD-HHMMSS.zip`).

**Restore**: A backup ZIP is extracted locally, validated (must contain `templates/templates.json`), then uploaded to the device. The existing templates directory is renamed as a safety backup on the device (`templates_backup_YYYYMMDD-HHMMSS`) before uploading.

## Template File Format

### Supported Types

- **PNG** — Raster images
- **SVG** — Vector graphics

### Dimensions

| Device | Resolution |
|--------|-----------|
| reMarkable 1 & 2 | 1404 x 1872 pixels |
| reMarkable Pro | 1620 x 2160 pixels |

### Filename Rules

Template filenames (without extension) must match: `^[a-zA-Z0-9_-]+$`

- Letters (a-z, A-Z), numbers (0-9), hyphens (`-`), underscores (`_`)
- No spaces or special characters
- Valid: `my-template`, `template_01`, `MyTemplate123`
- Invalid: `my template` (space), `template@1` (special character)
