package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
)

// Config represents the application configuration
type Config struct {
	Version       string       `json:"version"`
	Device        DeviceConfig `json:"device"`
	LastBackupDir string       `json:"lastBackupDir,omitempty"`
}

// DeviceConfig represents the device connection configuration
type DeviceConfig struct {
	IP         string `json:"ip"`
	SSHKeyPath string `json:"sshKeyPath"`
}

const (
	configVersion = "1"
	appName       = "remarkable-template-manager"
	configFile    = "config.json"
)

// GetConfigPath returns the full path to the configuration file
func GetConfigPath() (string, error) {
	configDir, err := os.UserConfigDir()
	if err != nil {
		return "", fmt.Errorf("failed to get user config directory: %w", err)
	}

	appConfigDir := filepath.Join(configDir, appName)
	configPath := filepath.Join(appConfigDir, configFile)

	return configPath, nil
}

// LoadConfig loads the configuration from disk
// Returns nil and no error if the config file doesn't exist
func LoadConfig() (*Config, error) {
	configPath, err := GetConfigPath()
	if err != nil {
		return nil, err
	}

	// Check if config file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// No config file is not an error - just return nil
		return nil, nil
	}

	// Read the config file
	data, err := os.ReadFile(configPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	// Parse JSON
	var config Config
	if err := json.Unmarshal(data, &config); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return &config, nil
}

// SaveConfig saves the configuration to disk
func SaveConfig(config *Config) error {
	configPath, err := GetConfigPath()
	if err != nil {
		return err
	}

	// Create config directory if it doesn't exist
	configDir := filepath.Dir(configPath)
	if err := os.MkdirAll(configDir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	// Marshal config to JSON with indentation for readability
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// Write to file with restricted permissions (owner read/write only)
	if err := os.WriteFile(configPath, data, 0600); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

// DeleteConfig removes the configuration file from disk
func DeleteConfig() error {
	configPath, err := GetConfigPath()
	if err != nil {
		return err
	}

	// Check if config file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		// File doesn't exist, nothing to delete
		return nil
	}

	// Remove the config file
	if err := os.Remove(configPath); err != nil {
		return fmt.Errorf("failed to delete config file: %w", err)
	}

	return nil
}
