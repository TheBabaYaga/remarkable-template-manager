package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
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

// BackupTemplates creates a compressed backup of the templates directory locally
func (a *App) BackupTemplates(targetDir string) (*BackupResult, error) {
	log.Println("[Backup] Starting backup process...")

	if a.sshClient == nil {
		log.Println("[Backup] ERROR: Not connected to reMarkable device")
		return nil, fmt.Errorf("not connected to reMarkable device")
	}

	// Check if source directory exists on device
	checkSession, err := a.sshClient.NewSession()
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to create SSH session: %v", err)
		return nil, fmt.Errorf("failed to create SSH session: %w", err)
	}
	output, err := checkSession.CombinedOutput("test -d /usr/share/remarkable/templates && echo 'exists' || echo 'missing'")
	checkSession.Close()
	if err != nil || strings.TrimSpace(string(output)) != "exists" {
		log.Printf("[Backup] ERROR: Templates directory not found on device")
		return nil, fmt.Errorf("templates directory not found on device")
	}
	log.Println("[Backup] Templates directory verified on device")

	// Create temporary directory for download
	tempDir, err := os.MkdirTemp("", "remarkable-backup-*")
	if err != nil {
		log.Printf("[Backup] ERROR: Failed to create temp directory: %v", err)
		return nil, fmt.Errorf("failed to create temporary directory: %w", err)
	}
	defer os.RemoveAll(tempDir) // Clean up temp directory
	log.Printf("[Backup] Created temporary directory: %s", tempDir)

	// Download templates directory from device
	log.Println("[Backup] Downloading templates from device...")
	templatesPath := "/usr/share/remarkable/templates"
	localTemplatesPath := filepath.Join(tempDir, "templates")
	
	if err := a.downloadDirectoryRecursive(templatesPath, localTemplatesPath); err != nil {
		log.Printf("[Backup] ERROR: Failed to download templates: %v", err)
		return nil, fmt.Errorf("failed to download templates: %w", err)
	}
	log.Println("[Backup] Templates downloaded successfully")

	// Generate backup filename
	timestamp := time.Now().Format("20060102-150405")
	backupFilename := fmt.Sprintf("remarkable-templates-backup-%s.zip", timestamp)
	backupPath := filepath.Join(targetDir, backupFilename)
	log.Printf("[Backup] Creating compressed backup at: %s", backupPath)

	// Compress the downloaded directory
	if err := compressDirectory(localTemplatesPath, backupPath); err != nil {
		log.Printf("[Backup] ERROR: Failed to compress backup: %v", err)
		return nil, fmt.Errorf("failed to compress backup: %w", err)
	}
	log.Println("[Backup] Compression completed successfully")

	// Get file size for result
	fileInfo, err := os.Stat(backupPath)
	if err != nil {
		log.Printf("[Backup] WARNING: Failed to get backup file size: %v", err)
		return &BackupResult{
			FilePath:  backupPath,
			SizeBytes: 0,
		}, nil
	}

	result := &BackupResult{
		FilePath:  backupPath,
		SizeBytes: fileInfo.Size(),
	}

	log.Printf("[Backup] SUCCESS: Backup completed at %s (size: %d bytes)", backupPath, result.SizeBytes)
	return result, nil
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
