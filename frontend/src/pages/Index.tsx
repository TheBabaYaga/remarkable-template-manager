import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Unplug, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import RemarkableDevice from "@/components/RemarkableDevice";
import SetupChoiceDialog from "@/components/SetupChoiceDialog";
import SSHKeySelectionDialog from "@/components/SSHKeySelectionDialog";
import SimplifiedSetupDialog from "@/components/SimplifiedSetupDialog";
import ConnectionLostDialog from "@/components/ConnectionLostDialog";
import SyncSuccessDialog from "@/components/SyncSuccessDialog";
import SupportDialog from "@/components/SupportDialog";
import TemplateList, { Template, SelectedFileInfo } from "@/components/TemplateList";
import { FetchTemplates, DisconnectSSH, ConnectSSH, CheckConnection, BackupTemplates, SyncTemplates, RebootDevice, GetVersion, LoadConfig, SaveConfig, DeleteConfig } from "wailsjs/go/main/App";
import { main } from "wailsjs/go/models";
import { mapDeviceTemplatesToTemplates, removeFileExtension } from "@/lib/template-utils";

type DialogState = "closed" | "setup-choice" | "ssh-select" | "simplified";

interface ConnectionInfo {
  method: "ssh";
  ip: string;
  keyPath?: string;
  templates: Template[];
}

interface SavedConfig {
  ip: string;
  sshKeyPath: string;
}

const Index = () => {
  const [dialogState, setDialogState] = useState<DialogState>("closed");
  const [connection, setConnection] = useState<ConnectionInfo | null>(null);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [connectionLost, setConnectionLost] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [syncSuccessDialog, setSyncSuccessDialog] = useState<{ open: boolean; count: number }>({ open: false, count: 0 });
  const [version, setVersion] = useState<string>("");
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [savedConfig, setSavedConfig] = useState<SavedConfig | null>(null);


  // Fetch version on mount
  useEffect(() => {
    GetVersion().then(setVersion).catch(() => setVersion("dev"));
  }, []);

  // Load saved config on mount
  useEffect(() => {
    LoadConfig()
      .then((config) => {
        if (config?.device) {
          setSavedConfig({
            ip: config.device.ip,
            sshKeyPath: config.device.sshKeyPath,
          });
        }
      })
      .catch((error) => {
        console.error("Failed to load config:", error);
      });
  }, []);

  // Periodic connection check
  useEffect(() => {
    if (!connection) return;

    const checkConnectionHealth = async () => {
      try {
        await CheckConnection();
      } catch {
        setConnectionLost(true);
      }
    };

    // Run immediately, then every 10 seconds
    checkConnectionHealth();
    const interval = setInterval(checkConnectionHealth, 10000);
    return () => clearInterval(interval);
  }, [connection]);

  const handleRetryConnection = useCallback(async () => {
    if (!connection || !connection.keyPath) return;
    
    setIsRetrying(true);
    try {
      await ConnectSSH(connection.keyPath, connection.ip);
      const templates = await FetchTemplates();
      setConnection({
        ...connection,
        templates: mapDeviceTemplatesToTemplates(templates),
      });
      setConnectionLost(false);
    } catch (error) {
      console.error("Failed to reconnect:", error);
      // Keep dialog open on failure
    } finally {
      setIsRetrying(false);
    }
  }, [connection]);

  const handleConnectionLostDisconnect = useCallback(async () => {
    setConnectionLost(false);
    try {
      await DisconnectSSH();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
    setConnection(null);
  }, []);

  const loadTemplatesFromDevice = async (method: "ssh", ip: string, keyPath?: string) => {
    setIsLoadingTemplates(true);
    try {
      const templates = await FetchTemplates();
      setConnection({
        method,
        ip,
        keyPath,
        templates: mapDeviceTemplatesToTemplates(templates),
      });
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      // Set connection with empty templates on error
      setConnection({ method, ip, keyPath, templates: [] });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleSSHConnect = async (keyPath: string, ip: string) => {
    console.log("Connected with SSH key:", { keyPath, ip });
    setDialogState("closed");
    await loadTemplatesFromDevice("ssh", ip, keyPath);
    
    // Save config after successful connection
    try {
      await SaveConfig(ip, keyPath);
      setSavedConfig({ ip, sshKeyPath: keyPath });
    } catch (error) {
      console.error("Failed to save config:", error);
      // Don't block connection if config save fails
    }
  };

  const handleSetupChoice = (type: "simplified" | "advanced") => {
    setDialogState("closed"); // Close setup choice first
    if (type === "advanced") {
      setDialogState("ssh-select");
    } else {
      setDialogState("simplified");
    }
  };

  const handleDisconnect = async () => {
    try {
      await DisconnectSSH();
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
    setConnection(null);
  };

  const handleQuickConnect = async () => {
    if (!savedConfig) return;
    
    try {
      await ConnectSSH(savedConfig.sshKeyPath, savedConfig.ip);
      await loadTemplatesFromDevice("ssh", savedConfig.ip, savedConfig.sshKeyPath);
    } catch (error) {
      console.error("Quick connect failed:", error);
      // On failure, show the connection dialog
      setDialogState("ssh-select");
    }
  };

  const handleClearConfig = async () => {
    try {
      await DeleteConfig();
      setSavedConfig(null);
    } catch (error) {
      console.error("Failed to clear config:", error);
    }
  };

  const handleAddTemplate = (fileInfo: SelectedFileInfo) => {
    if (!connection) return;
    // Remove any file extension (.svg, .png, etc.)
    const baseName = removeFileExtension(fileInfo.name);
    const newTemplate: Template = {
      name: baseName,
      filename: baseName,
      iconCode: "\ue9fe", // Default icon
      categories: ["Custom"],
      synced: false, // New templates are not synced yet
      localPath: fileInfo.path, // Store full path for SCP upload
    };
    setConnection({
      ...connection,
      templates: [...connection.templates, newTemplate],
    });
  };

  const handleDeleteTemplates = (filenames: string[]) => {
    if (!connection) return;
    setConnection({
      ...connection,
      templates: connection.templates.map(t =>
        filenames.includes(t.filename)
          ? { ...t, deletionPending: true }
          : t
      ),
    });
  };

  const handleSync = async () => {
    if (!connection) return;
    
    // Get unsynced templates with their local paths
    const unsyncedTemplates = connection.templates.filter(t => t.synced === false && t.localPath);
    // Get templates pending deletion
    const deletionPendingTemplates = connection.templates.filter(t => t.deletionPending === true);
    
    if (unsyncedTemplates.length === 0 && deletionPendingTemplates.length === 0) return;
    
    // Store filenames that will be synced
    const syncedFilenames = new Set(unsyncedTemplates.map(t => t.filename));
    // Store filenames that will be deleted
    const deletedFilenames = new Set(deletionPendingTemplates.map(t => t.filename));
    
    // Prepare sync data for backend
    const syncData: main.SyncTemplate[] = unsyncedTemplates.map(t => ({
      name: t.name,
      filename: t.filename,
      localPath: t.localPath!,
    }));
    
    // Prepare deletion data
    const deletionData: string[] = deletionPendingTemplates.map(t => t.filename);
    
    // Call backend to sync (including deletions)
    await SyncTemplates(syncData, deletionData);
    
    // Mark templates as synced and remove deletion pending, or remove deleted templates
    setConnection({
      ...connection,
      templates: connection.templates
        .filter(t => !(t.deletionPending === true && deletedFilenames.has(t.filename)))
        .map(t =>
          t.synced === false && syncedFilenames.has(t.filename)
            ? { ...t, synced: true, localPath: undefined }
            : t
        ),
    });
  };

  const handleUpdateTemplateName = (filename: string, newName: string) => {
    if (!connection) return;
    setConnection({
      ...connection,
      templates: connection.templates.map(t =>
        t.filename === filename && t.synced === false
          ? { ...t, name: newName }
          : t
      ),
    });
  };

  const handleBackup = async () => {
    try {
      const backupPath = await BackupTemplates();
      console.log("Backup completed:", backupPath);
    } catch (error) {
      console.error("Backup failed:", error);
      throw error; // Re-throw so TemplateList can handle the error state
    }
  };

  const handleSyncSuccess = (count: number) => {
    setSyncSuccessDialog({ open: true, count });
  };

  const handleReboot = async () => {
    try {
      await RebootDevice();
      // Reboot will disconnect, so disconnect and return to main screen
      await DisconnectSSH();
      setConnection(null);
      setSyncSuccessDialog({ open: false, count: 0 });
    } catch (error) {
      console.error("Reboot failed:", error);
      // Even if reboot fails, disconnect and return to main screen
      try {
        await DisconnectSSH();
      } catch (disconnectError) {
        console.error("Disconnect failed:", disconnectError);
      }
      setConnection(null);
      setSyncSuccessDialog({ open: false, count: 0 });
    }
  };

  const handleConnectionLost = () => {
    setConnectionLost(true);
  };

  const isConnected = connection !== null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xs font-normal text-muted-foreground">
            {version || "dev"}
          </h1>
          <button
            onClick={() => setSupportDialogOpen(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
          >
            <Heart className="w-3 h-3 group-hover:text-red-500 transition-colors" />
            <span>Support</span>
          </button>
        </div>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-sm text-green-500"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Connected
            </span>
          </motion.div>
        )}
      </motion.header>

      {/* Main Content */}
      {isConnected ? (
        <main className="flex items-center justify-center gap-8">
          {/* Device Section */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6">
              <RemarkableDevice />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3 mb-6"
            >
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <CheckCircle className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">
                reMarkable connected
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Connected via SSH to{" "}
                <span className="font-mono text-sm">{connection.ip}</span>
              </p>
            </motion.div>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleDisconnect}
              className="gap-2"
            >
              <Unplug className="w-4 h-4" />
              Disconnect
            </Button>
          </div>

          {/* Connection Arrow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="flex items-center"
          >
            <ArrowRight className="w-8 h-8 text-muted-foreground" />
          </motion.div>

          {/* Templates Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isLoadingTemplates ? (
              <div className="flex items-center justify-center w-[400px] h-[420px]">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-sm">Loading templates...</span>
                </div>
              </div>
            ) : (
              <TemplateList 
                templates={connection.templates} 
                onAddTemplate={handleAddTemplate}
                onBackup={handleBackup}
                onSync={handleSync}
                onUpdateTemplateName={handleUpdateTemplateName}
                onSyncSuccess={handleSyncSuccess}
                onDeleteTemplates={handleDeleteTemplates}
                onConnectionLost={handleConnectionLost}
              />
            )}
          </motion.div>
        </main>
      ) : (
        <main className="flex flex-col items-center text-center max-w-sm w-full">
          {/* Device Illustration */}
          <div className="mb-12 w-full flex justify-center">
            <RemarkableDevice />
          </div>

          {/* Text Content and Button */}
          <div className="flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-3 mb-10 w-full flex flex-col items-center"
            >
              <h2 className="text-2xl font-serif font-medium text-foreground tracking-tight">
                No reMarkable connected
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Connect your device to get started
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="w-full flex flex-col items-center gap-3"
            >
              {savedConfig ? (
                <>
                  <Button variant="connect" size="lg" onClick={handleQuickConnect} className="w-full max-w-xs">
                    Connect to {savedConfig.ip}
                  </Button>
                  <div className="flex gap-2 w-full max-w-xs">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setDialogState("ssh-select")}
                      className="flex-1"
                    >
                      Different Device
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleClearConfig}
                      className="flex-1"
                    >
                      Clear Saved
                    </Button>
                  </div>
                </>
              ) : (
                <Button variant="connect" size="lg" onClick={() => setDialogState("setup-choice")}>
                  Connect Device
                </Button>
              )}
            </motion.div>
          </div>
        </main>
      )}

      {/* Setup Choice Dialog */}
      <SetupChoiceDialog
        open={dialogState === "setup-choice"}
        onOpenChange={(open) => setDialogState(open ? "setup-choice" : "closed")}
        onSelectSetup={handleSetupChoice}
      />

      {/* SSH Key Selection Dialog */}
      <SSHKeySelectionDialog
        open={dialogState === "ssh-select"}
        onOpenChange={(open) => setDialogState(open ? "ssh-select" : "closed")}
        onBack={() => setDialogState("closed")}
        onConnect={handleSSHConnect}
      />

      {/* Simplified Setup Dialog */}
      <SimplifiedSetupDialog
        open={dialogState === "simplified"}
        onOpenChange={(open) => setDialogState(open ? "simplified" : "closed")}
        onBack={() => setDialogState("closed")}
        onConnect={handleSSHConnect}
      />

      {/* Connection Lost Dialog */}
      <ConnectionLostDialog
        open={connectionLost}
        onRetry={handleRetryConnection}
        onDisconnect={handleConnectionLostDisconnect}
        isRetrying={isRetrying}
      />

      {/* Sync Success Dialog */}
      <SyncSuccessDialog
        open={syncSuccessDialog.open}
        templateCount={syncSuccessDialog.count}
        onReboot={handleReboot}
        onClose={() => setSyncSuccessDialog({ open: false, count: 0 })}
      />

      <SupportDialog
        open={supportDialogOpen}
        onClose={() => setSupportDialogOpen(false)}
      />
    </div>
  );
};

export default Index;
