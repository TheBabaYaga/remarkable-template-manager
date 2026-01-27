package main

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"log"
	"net"
	"os"
	"path/filepath"
	"strings"
	"time"

	"golang.org/x/crypto/ssh"
)

// ListSSHKeys returns a list of SSH private keys found in ~/.ssh
func (a *App) ListSSHKeys() ([]SSHKey, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get home directory: %w", err)
	}

	sshDir := filepath.Join(homeDir, ".ssh")
	entries, err := os.ReadDir(sshDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []SSHKey{}, nil
		}
		return nil, fmt.Errorf("failed to read .ssh directory: %w", err)
	}

	var keys []SSHKey
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()

		// Skip public keys, known_hosts, config, and other non-key files
		if strings.HasSuffix(name, ".pub") ||
			name == "known_hosts" ||
			name == "known_hosts.old" ||
			name == "config" ||
			name == "authorized_keys" ||
			strings.HasSuffix(name, ".pem") {
			continue
		}

		// Check if it looks like a private key by reading first few bytes
		fullPath := filepath.Join(sshDir, name)
		content, err := os.ReadFile(fullPath)
		if err != nil {
			continue
		}

		// Check for common private key headers
		contentStr := string(content)
		if strings.Contains(contentStr, "PRIVATE KEY") ||
			strings.HasPrefix(contentStr, "-----BEGIN OPENSSH PRIVATE KEY-----") ||
			strings.HasPrefix(contentStr, "-----BEGIN RSA PRIVATE KEY-----") ||
			strings.HasPrefix(contentStr, "-----BEGIN EC PRIVATE KEY-----") ||
			strings.HasPrefix(contentStr, "-----BEGIN DSA PRIVATE KEY-----") {
			keys = append(keys, SSHKey{
				Name: name,
				Path: "~/.ssh/" + name,
			})
		}
	}

	return keys, nil
}

// expandPath expands ~ to the user's home directory
func expandPath(path string) (string, error) {
	if strings.HasPrefix(path, "~/") {
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", err
		}
		return filepath.Join(homeDir, path[2:]), nil
	}
	return path, nil
}

// ConnectSSH establishes an SSH connection to the device using the specified key
func (a *App) ConnectSSH(keyPath string, ip string) error {
	// Expand the key path
	expandedPath, err := expandPath(keyPath)
	if err != nil {
		return fmt.Errorf("failed to expand key path: %w", err)
	}

	// Read the private key
	keyData, err := os.ReadFile(expandedPath)
	if err != nil {
		return fmt.Errorf("failed to read private key: %w", err)
	}

	// Parse the private key
	signer, err := ssh.ParsePrivateKey(keyData)
	if err != nil {
		return fmt.Errorf("failed to parse private key: %w", err)
	}

	// Configure SSH client
	config := &ssh.ClientConfig{
		User: "root",
		Auth: []ssh.AuthMethod{
			ssh.PublicKeys(signer),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(), // For reMarkable device
		Timeout:         10 * time.Second,
	}

	// Connect to the device
	address := net.JoinHostPort(ip, "22")
	client, err := ssh.Dial("tcp", address, config)
	if err != nil {
		return fmt.Errorf("failed to connect: %w", err)
	}

	// Store the client for later use
	a.sshClient = client

	// Remount root filesystem as read-write to ensure write access
	log.Println("[ConnectSSH] Remounting root filesystem as read-write...")
	session, err := client.NewSession()
	if err != nil {
		log.Printf("[ConnectSSH] WARNING: Failed to create session for remount: %v", err)
		// Don't fail the connection if remount fails, but log it
		return nil
	}
	defer session.Close()

	remountOutput, err := session.CombinedOutput("mount -o remount,rw /")
	if err != nil {
		log.Printf("[ConnectSSH] WARNING: Failed to remount filesystem: %v, output: %s", err, string(remountOutput))
		// Don't fail the connection if remount fails, but log it
	} else {
		log.Printf("[ConnectSSH] Filesystem remounted successfully, output: %s", string(remountOutput))
	}

	return nil
}

// DisconnectSSH closes the SSH connection
func (a *App) DisconnectSSH() error {
	if a.sshClient != nil {
		err := a.sshClient.Close()
		a.sshClient = nil
		return err
	}
	return nil
}

// IsConnected returns true if there is an active SSH connection
func (a *App) IsConnected() bool {
	return a.sshClient != nil
}

// CheckConnection tests if the SSH connection is still alive
func (a *App) CheckConnection() error {
	if a.sshClient == nil {
		return fmt.Errorf("not connected")
	}

	session, err := a.sshClient.NewSession()
	if err != nil {
		return fmt.Errorf("connection lost: %w", err)
	}
	defer session.Close()

	if err := session.Run("echo ok"); err != nil {
		return fmt.Errorf("connection lost: %w", err)
	}

	return nil
}

// generateRandomID generates a random ID for the key name
func generateRandomID() string {
	b := make([]byte, 8)
	rand.Read(b)
	return fmt.Sprintf("%x", b)
}

// GenerateSSHKey generates a new RSA SSH key pair and stores it in ~/.ssh
// Returns the generated key information
func (a *App) GenerateSSHKey() (SSHKey, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return SSHKey{}, fmt.Errorf("failed to get home directory: %w", err)
	}

	sshDir := filepath.Join(homeDir, ".ssh")

	// Ensure .ssh directory exists with correct permissions
	if err := os.MkdirAll(sshDir, 0700); err != nil {
		return SSHKey{}, fmt.Errorf("failed to create .ssh directory: %w", err)
	}

	// Generate unique key name
	keyName := fmt.Sprintf("remarkable_%s", generateRandomID())
	privateKeyPath := filepath.Join(sshDir, keyName)
	publicKeyPath := privateKeyPath + ".pub"

	// Generate RSA key pair (4096 bits for good security)
	privateKey, err := rsa.GenerateKey(rand.Reader, 4096)
	if err != nil {
		return SSHKey{}, fmt.Errorf("failed to generate RSA key: %w", err)
	}

	// Encode private key to PEM format
	privateKeyPEM := &pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(privateKey),
	}

	// Write private key file
	privateKeyFile, err := os.OpenFile(privateKeyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return SSHKey{}, fmt.Errorf("failed to create private key file: %w", err)
	}
	defer privateKeyFile.Close()

	if err := pem.Encode(privateKeyFile, privateKeyPEM); err != nil {
		return SSHKey{}, fmt.Errorf("failed to write private key: %w", err)
	}

	// Generate SSH public key
	publicKey, err := ssh.NewPublicKey(&privateKey.PublicKey)
	if err != nil {
		return SSHKey{}, fmt.Errorf("failed to generate public key: %w", err)
	}

	// Write public key file in authorized_keys format
	publicKeyBytes := ssh.MarshalAuthorizedKey(publicKey)
	if err := os.WriteFile(publicKeyPath, publicKeyBytes, 0644); err != nil {
		return SSHKey{}, fmt.Errorf("failed to write public key: %w", err)
	}

	return SSHKey{
		Name: keyName,
		Path: "~/.ssh/" + keyName,
	}, nil
}

// UploadSSHKey uploads the public key to the device using password authentication,
// then reconnects using the key to verify it works
func (a *App) UploadSSHKey(keyPath string, ip string, password string) error {
	// Expand the key path and get the public key path
	expandedPrivateKeyPath, err := expandPath(keyPath)
	if err != nil {
		return fmt.Errorf("failed to expand key path: %w", err)
	}
	publicKeyPath := expandedPrivateKeyPath + ".pub"

	// Read the public key
	publicKeyData, err := os.ReadFile(publicKeyPath)
	if err != nil {
		return fmt.Errorf("failed to read public key: %w", err)
	}
	publicKeyContent := strings.TrimSpace(string(publicKeyData))

	// Connect with password authentication
	passwordConfig := &ssh.ClientConfig{
		User: "root",
		Auth: []ssh.AuthMethod{
			ssh.Password(password),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         10 * time.Second,
	}

	address := net.JoinHostPort(ip, "22")
	passwordClient, err := ssh.Dial("tcp", address, passwordConfig)
	if err != nil {
		return fmt.Errorf("failed to connect with password: %w", err)
	}
	defer passwordClient.Close()

	// Create a session to run the key upload command
	session, err := passwordClient.NewSession()
	if err != nil {
		return fmt.Errorf("failed to create SSH session: %w", err)
	}
	defer session.Close()

	// Command to create .ssh directory and append the public key to authorized_keys
	// Using single quotes around the key to prevent shell interpretation
	cmd := fmt.Sprintf(`mkdir -p ~/.ssh && echo '%s' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys`, publicKeyContent)

	if err := session.Run(cmd); err != nil {
		return fmt.Errorf("failed to upload key to device: %w", err)
	}

	// Close password connection
	passwordClient.Close()

	// Now reconnect using the key to verify it works
	return a.ConnectSSH(keyPath, ip)
}
