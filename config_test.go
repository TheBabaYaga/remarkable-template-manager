package main

import (
	"os"
	"path/filepath"
	"testing"
)

func TestGetConfigPath(t *testing.T) {
	path, err := GetConfigPath()
	if err != nil {
		t.Fatalf("GetConfigPath failed: %v", err)
	}

	if path == "" {
		t.Fatal("GetConfigPath returned empty path")
	}

	// Should contain the app name
	if !filepath.IsAbs(path) {
		t.Fatalf("GetConfigPath should return absolute path, got: %s", path)
	}

	t.Logf("Config path: %s", path)
}

func TestSaveAndLoadConfig(t *testing.T) {
	// Clean up any existing test config
	defer DeleteConfig()

	// Create test config
	testConfig := &Config{
		Version: configVersion,
		Device: DeviceConfig{
			IP:         "10.11.99.1",
			SSHKeyPath: "/test/path/to/key",
		},
	}

	// Save config
	err := SaveConfig(testConfig)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	// Load config
	loadedConfig, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig failed: %v", err)
	}

	if loadedConfig == nil {
		t.Fatal("LoadConfig returned nil")
	}

	// Verify config values
	if loadedConfig.Version != testConfig.Version {
		t.Errorf("Version mismatch: got %s, want %s", loadedConfig.Version, testConfig.Version)
	}

	if loadedConfig.Device.IP != testConfig.Device.IP {
		t.Errorf("IP mismatch: got %s, want %s", loadedConfig.Device.IP, testConfig.Device.IP)
	}

	if loadedConfig.Device.SSHKeyPath != testConfig.Device.SSHKeyPath {
		t.Errorf("SSHKeyPath mismatch: got %s, want %s", loadedConfig.Device.SSHKeyPath, testConfig.Device.SSHKeyPath)
	}
}

func TestDeleteConfig(t *testing.T) {
	// Create a test config first
	testConfig := &Config{
		Version: configVersion,
		Device: DeviceConfig{
			IP:         "10.11.99.1",
			SSHKeyPath: "/test/path/to/key",
		},
	}

	err := SaveConfig(testConfig)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	// Delete config
	err = DeleteConfig()
	if err != nil {
		t.Fatalf("DeleteConfig failed: %v", err)
	}

	// Verify config is deleted
	loadedConfig, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig after delete failed: %v", err)
	}

	if loadedConfig != nil {
		t.Error("Config should be nil after deletion")
	}
}

func TestLoadConfigWhenNotExists(t *testing.T) {
	// Ensure config doesn't exist
	DeleteConfig()

	// Load config
	config, err := LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig should not error when config doesn't exist: %v", err)
	}

	if config != nil {
		t.Error("Config should be nil when file doesn't exist")
	}
}

func TestConfigFilePermissions(t *testing.T) {
	// Clean up
	defer DeleteConfig()

	// Create test config
	testConfig := &Config{
		Version: configVersion,
		Device: DeviceConfig{
			IP:         "10.11.99.1",
			SSHKeyPath: "/test/path/to/key",
		},
	}

	err := SaveConfig(testConfig)
	if err != nil {
		t.Fatalf("SaveConfig failed: %v", err)
	}

	// Get config path and check permissions
	configPath, err := GetConfigPath()
	if err != nil {
		t.Fatalf("GetConfigPath failed: %v", err)
	}

	info, err := os.Stat(configPath)
	if err != nil {
		t.Fatalf("Failed to stat config file: %v", err)
	}

	// Check that permissions are 0600 (owner read/write only)
	perm := info.Mode().Perm()
	expected := os.FileMode(0600)
	if perm != expected {
		t.Errorf("Config file permissions: got %o, want %o", perm, expected)
	}
}
