package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"
)

// FetchTemplates reads the templates.json from the reMarkable device and returns the templates
func (a *App) FetchTemplates() ([]DeviceTemplate, error) {
	if a.sshClient == nil {
		return nil, fmt.Errorf("not connected to device")
	}

	// Create a new session
	session, err := a.sshClient.NewSession()
	if err != nil {
		return nil, fmt.Errorf("failed to create SSH session: %w", err)
	}
	defer session.Close()

	// Read the templates.json file
	output, err := session.Output("cat /usr/share/remarkable/templates/templates.json")
	if err != nil {
		return nil, fmt.Errorf("failed to read templates.json: %w", err)
	}

	// Parse the JSON
	var data templatesJSON
	if err := json.Unmarshal(output, &data); err != nil {
		return nil, fmt.Errorf("failed to parse templates.json: %w", err)
	}

	return data.Templates, nil
}

// BackupTemplates creates a backup of the templates directory on the reMarkable device
func (a *App) BackupTemplates() (string, error) {
	log.Println("[Backup] Starting backup process...")

	if a.sshClient == nil {
		log.Println("[Backup] ERROR: Not connected to reMarkable device")
		return "", fmt.Errorf("not connected to reMarkable device")
	}

	// Generate backup directory name: backup_YYYYMMDD_HHMMSS
	timestamp := time.Now().Format("20060102_150405")
	backupDir := fmt.Sprintf("/usr/share/remarkable/templates_backup/backup_%s", timestamp)
	log.Printf("[Backup] Backup directory: %s", backupDir)

	// Check if source directory exists
	checkSession, err := a.sshClient.NewSession()
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to create SSH session for check: %v", err)
		return "", fmt.Errorf("failed to create SSH session: %w", err)
	}

	output, err := checkSession.CombinedOutput("test -d /usr/share/remarkable/templates && echo 'exists' || echo 'missing'")
	checkSession.Close()
	if err != nil {
		log.Printf("[Backup] WARNING: Failed to check source directory: %v", err)
	} else {
		log.Printf("[Backup] Source directory check: %s", strings.TrimSpace(string(output)))
	}

	// Create backup directory first
	log.Println("[Backup] Creating backup directory...")
	mkdirSession, err := a.sshClient.NewSession()
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to create SSH session for mkdir: %v", err)
		return "", fmt.Errorf("failed to create SSH session: %w", err)
	}
	mkdirCmd := "mkdir -p /usr/share/remarkable/templates_backup"
	mkdirOutput, err := mkdirSession.CombinedOutput(mkdirCmd)
	mkdirSession.Close()
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to create backup directory: %v, output: %s", err, string(mkdirOutput))
		return "", fmt.Errorf("failed to create backup directory: %w, output: %s", err, string(mkdirOutput))
	}
	log.Printf("[Backup] Backup directory created, output: %s", string(mkdirOutput))

	// Check if templates directory exists and get its size
	checkSession2, err := a.sshClient.NewSession()
	if err != nil {
		log.Printf("[Backup] WARNING: Failed to create session for size check: %v", err)
	} else {
		sizeOutput, err := checkSession2.CombinedOutput("du -sh /usr/share/remarkable/templates 2>&1")
		checkSession2.Close()
		if err != nil {
			log.Printf("[Backup] WARNING: Failed to get templates size: %v, output: %s", err, string(sizeOutput))
		} else {
			log.Printf("[Backup] Templates directory size: %s", strings.TrimSpace(string(sizeOutput)))
		}
	}

	// Copy templates
	log.Println("[Backup] Copying templates...")
	cpCmd := fmt.Sprintf("cp -r /usr/share/remarkable/templates %s", backupDir)
	log.Printf("[Backup] Executing command: %s", cpCmd)

	cpSession, err := a.sshClient.NewSession()
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to create SSH session for copy: %v", err)
		return "", fmt.Errorf("failed to create SSH session for copy: %w", err)
	}
	cpOutput, err := cpSession.CombinedOutput(cpCmd)
	cpSession.Close()
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to copy templates: %v, output: %s", err, string(cpOutput))
		return "", fmt.Errorf("failed to backup templates: %w, output: %s", err, string(cpOutput))
	}
	log.Printf("[Backup] Copy command output: %s", string(cpOutput))

	// Verify backup was created
	verifySession, err := a.sshClient.NewSession()
	if err != nil {
		log.Printf("[Backup] WARNING: Failed to create session for verification: %v", err)
	} else {
		verifyOutput, err := verifySession.CombinedOutput(fmt.Sprintf("test -d %s && echo 'backup exists' || echo 'backup missing'", backupDir))
		verifySession.Close()
		if err != nil {
			log.Printf("[Backup] WARNING: Failed to verify backup: %v, output: %s", err, string(verifyOutput))
		} else {
			log.Printf("[Backup] Backup verification: %s", strings.TrimSpace(string(verifyOutput)))
		}
	}

	log.Printf("[Backup] SUCCESS: Backup completed at %s", backupDir)
	return backupDir, nil
}

// SyncTemplates uploads new templates to the device and updates templates.json
func (a *App) SyncTemplates(templates []SyncTemplate, deletions []string) error {
	if a.sshClient == nil {
		return fmt.Errorf("not connected to reMarkable device")
	}

	if len(templates) == 0 && len(deletions) == 0 {
		return nil
	}

	// Step 1: Upload each template file via SCP
	for _, tmpl := range templates {
		if err := a.scpUploadFile(tmpl.LocalPath, "/usr/share/remarkable/templates/"); err != nil {
			return fmt.Errorf("failed to upload %s: %w", tmpl.Filename, err)
		}
	}

	// Step 2: Read current templates.json from device
	session, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}

	output, err := session.Output("cat /usr/share/remarkable/templates/templates.json")
	session.Close()
	if err != nil {
		return fmt.Errorf("failed to read templates.json: %w", err)
	}

	var data templatesJSON
	if err := json.Unmarshal(output, &data); err != nil {
		return fmt.Errorf("failed to parse templates.json: %w", err)
	}

	// Step 3: Remove deleted template entries
	if len(deletions) > 0 {
		deletionSet := make(map[string]bool)
		for _, filename := range deletions {
			deletionSet[filename] = true
		}
		var filteredTemplates []DeviceTemplate
		for _, tmpl := range data.Templates {
			if !deletionSet[tmpl.Filename] {
				filteredTemplates = append(filteredTemplates, tmpl)
			}
		}
		data.Templates = filteredTemplates
	}

	// Step 4: Add new template entries
	for _, tmpl := range templates {
		newEntry := DeviceTemplate{
			Name:       tmpl.Name,
			Filename:   tmpl.Filename,
			IconCode:   "\ue9fe",
			Categories: []string{"Creative", "Lines", "Grids", "Planners"},
		}
		data.Templates = append(data.Templates, newEntry)
	}

	// Step 5: Write updated templates.json back to device
	updatedJSON, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal templates.json: %w", err)
	}

	// Write via SSH using stdin redirection
	writeSession, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session for write: %w", err)
	}
	defer writeSession.Close()

	// Get stdin pipe for writing
	stdin, err := writeSession.StdinPipe()
	if err != nil {
		return fmt.Errorf("failed to get stdin pipe: %w", err)
	}

	// Start writing in a goroutine
	go func() {
		defer stdin.Close()
		stdin.Write(updatedJSON)
	}()

	// Run cat command to write to file
	if err := writeSession.Run("cat > /usr/share/remarkable/templates/templates.json"); err != nil {
		return fmt.Errorf("failed to write templates.json: %w", err)
	}

	return nil
}
