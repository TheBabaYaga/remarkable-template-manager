package main

// SSHKey represents an SSH key found on the system
type SSHKey struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

// DeviceTemplate represents a template on the reMarkable device
type DeviceTemplate struct {
	Name       string   `json:"name"`
	Filename   string   `json:"filename"`
	IconCode   string   `json:"iconCode"`
	Landscape  bool     `json:"landscape,omitempty"`
	Categories []string `json:"categories"`
}

// templatesJSON is the structure of the templates.json file on the device
type templatesJSON struct {
	Templates []DeviceTemplate `json:"templates"`
}

// SelectedFile contains information about a selected file
type SelectedFile struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

// SyncTemplate represents a template to be synced to the device
type SyncTemplate struct {
	Name      string `json:"name"`
	Filename  string `json:"filename"`
	LocalPath string `json:"localPath"`
}
