import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Download, CheckCircle, CloudOff, RefreshCw, Loader2, Upload, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import DuplicateTemplateDialog from "@/components/DuplicateTemplateDialog";
import InvalidFilenameDialog from "@/components/InvalidFilenameDialog";
import { SelectTemplateFile, CheckConnection } from "wailsjs/go/main/App";
import { removeFileExtension } from "@/lib/template-utils";

export interface Template {
  name: string;
  filename: string;
  iconCode: string;
  landscape?: boolean;
  categories: string[];
  synced?: boolean;
  localPath?: string;
  deletionPending?: boolean;
}

export interface SelectedFileInfo {
  name: string;
  path: string;
}

interface TemplateListProps {
  templates: Template[];
  onAddTemplate?: (fileInfo: SelectedFileInfo) => void;
  onBackup?: () => Promise<void>;
  onSync?: () => Promise<void>;
  onUpdateTemplateName?: (filename: string, newName: string) => void;
  onSyncSuccess?: (count: number) => void;
  onDeleteTemplates?: (filenames: string[]) => void;
  onConnectionLost?: () => void;
}

const TemplateList = ({ templates, onAddTemplate, onBackup, onSync, onUpdateTemplateName, onSyncSuccess, onDeleteTemplates, onConnectionLost }: TemplateListProps) => {
  const [backupState, setBackupState] = useState<"idle" | "backing-up" | "complete">("idle");
  const [backupProgress, setBackupProgress] = useState(0);
  const [currentBackupFile, setCurrentBackupFile] = useState("");
  const [duplicateName, setDuplicateName] = useState<string | null>(null);
  const [invalidFilename, setInvalidFilename] = useState<string | null>(null);
  const [isAddingFile, setIsAddingFile] = useState(false);
  
  const [syncState, setSyncState] = useState<"idle" | "syncing" | "complete">("idle");
  const [syncProgress, setSyncProgress] = useState(0);
  const [currentSyncFile, setCurrentSyncFile] = useState("");
  const [syncedCount, setSyncedCount] = useState(0);
  
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  const unsyncedTemplates = templates.filter(t => t.synced === false && !t.deletionPending);
  const deletionPendingTemplates = templates.filter(t => t.deletionPending === true);
  const syncedTemplates = templates.filter(t => t.synced !== false && !t.deletionPending);
  const unsyncedCount = unsyncedTemplates.length;
  const deletionPendingCount = deletionPendingTemplates.length;

  const handleAddClick = async () => {
    try {
      const result = await SelectTemplateFile();
      
      // User cancelled
      if (!result) {
        return;
      }

      // Remove file extension to get base name
      const baseName = removeFileExtension(result.name);
      
      // Check for duplicates (case-insensitive)
      const isDuplicate = templates.some(t => 
        t.name.toLowerCase() === baseName.toLowerCase() ||
        t.filename.toLowerCase() === baseName.toLowerCase()
      );
      
      if (isDuplicate) {
        setDuplicateName(baseName);
        return;
      }
      
      if (onAddTemplate) {
        setIsAddingFile(true);
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));
        onAddTemplate(result);
        setIsAddingFile(false);
      }
    } catch (error) {
      console.error("Failed to select file:", error);
      setIsAddingFile(false);
      
      // Check if error is about invalid filename
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("invalid filename") || errorMessage.includes("spaces or special characters")) {
        // Extract filename from error message (format: "... Invalid filename: filename.png")
        const fileNameMatch = errorMessage.match(/Invalid filename: ([^\\.]+\.(svg|png))/i);
        const fileName = fileNameMatch ? fileNameMatch[1].trim() : "the selected file";
        setInvalidFilename(fileName);
        return;
      }
    }
  };

  const handleBackup = async () => {
    if (!onBackup) return;
    
    // Check connection before starting backup
    try {
      await CheckConnection();
    } catch (error) {
      console.error("Connection check failed:", error);
      if (onConnectionLost) {
        onConnectionLost();
      }
      return;
    }
    
    setBackupState("backing-up");
    setBackupProgress(0);

    // Simulate progress while the actual backup runs
    const progressInterval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    // Show file names being backed up
    let fileIndex = 0;
    const fileInterval = setInterval(() => {
      if (fileIndex < templates.length) {
        setCurrentBackupFile(templates[fileIndex].name);
        fileIndex++;
      }
    }, 150);

    try {
      await onBackup();
      clearInterval(progressInterval);
      clearInterval(fileInterval);
      setBackupProgress(100);
      setBackupState("complete");
    } catch (error) {
      console.error("Backup failed:", error);
      clearInterval(progressInterval);
      clearInterval(fileInterval);
      setBackupState("idle");
      return;
    }

    // Reset after showing completion
    setTimeout(() => {
      setBackupState("idle");
      setBackupProgress(0);
      setCurrentBackupFile("");
    }, 2500);
  };

  const handleSyncClick = async () => {
    if (!onSync || (unsyncedCount === 0 && deletionPendingCount === 0)) return;
    
    // Check connection before starting sync
    try {
      await CheckConnection();
    } catch (error) {
      console.error("Connection check failed:", error);
      if (onConnectionLost) {
        onConnectionLost();
      }
      return;
    }
    
    // Store the count before sync starts (include both uploads and deletions)
    const countToSync = unsyncedCount + deletionPendingCount;
    setSyncedCount(countToSync);
    setSyncState("syncing");
    setSyncProgress(0);

    // Simulate progress while the actual sync runs
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.floor(80 / countToSync);
      });
    }, 300);

    // Show file names being synced (both uploads and deletions)
    const allPendingTemplates = [...unsyncedTemplates, ...deletionPendingTemplates];
    let fileIndex = 0;
    const fileInterval = setInterval(() => {
      if (fileIndex < allPendingTemplates.length) {
        setCurrentSyncFile(allPendingTemplates[fileIndex].name);
        fileIndex++;
      }
    }, 400);

    try {
      await onSync();
      clearInterval(progressInterval);
      clearInterval(fileInterval);
      setSyncProgress(100);
      setSyncState("complete");
      
      // Notify parent of successful sync
      if (onSyncSuccess) {
        onSyncSuccess(countToSync);
      }
    } catch (error) {
      console.error("Sync failed:", error);
      clearInterval(progressInterval);
      clearInterval(fileInterval);
      setSyncState("idle");
      setSyncedCount(0);
      return;
    }

    // Reset after showing completion
    setTimeout(() => {
      setSyncState("idle");
      setSyncProgress(0);
      setCurrentSyncFile("");
      setSyncedCount(0);
    }, 2500);
  };

  const handleToggleSelection = (filename: string) => {
    setSelectedTemplates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedTemplates.size === 0 || !onDeleteTemplates) return;
    onDeleteTemplates(Array.from(selectedTemplates));
    setSelectedTemplates(new Set());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full max-w-md"
    >
      <Card className="border-border/50 relative overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Templates
            <span className="text-xs font-normal text-muted-foreground ml-auto">
              {templates.length} {templates.length === 1 ? "file" : "files"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {/* Backup overlay */}
          <AnimatePresence>
            {backupState !== "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg"
              >
                {backupState === "backing-up" ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4 px-6 w-full"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Download className="w-10 h-10 text-primary" />
                    </motion.div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium">Backing up templates...</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {currentBackupFile}
                      </p>
                    </div>
                    <div className="w-full max-w-[200px] space-y-1">
                      <Progress value={backupProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        {backupProgress}%
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary">Backup Complete!</p>
                      <p className="text-xs text-muted-foreground">
                        {templates.length} templates saved
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sync overlay */}
          <AnimatePresence>
            {syncState !== "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm rounded-lg"
              >
                {syncState === "syncing" ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-4 px-6 w-full"
                  >
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Upload className="w-10 h-10 text-primary" />
                    </motion.div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium">Syncing templates to device...</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {currentSyncFile}
                      </p>
                    </div>
                    <div className="w-full max-w-[200px] space-y-1">
                      <Progress value={syncProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">
                        {syncProgress}%
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-primary" />
                      </div>
                    </motion.div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-primary">Sync Complete!</p>
                      <p className="text-xs text-muted-foreground">
                        {syncedCount} {syncedCount === 1 ? "template" : "templates"} uploaded
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <ScrollArea className="h-[320px]">
            <div className="flex flex-col gap-1 pr-4">
              {/* Add button */}
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                onClick={handleAddClick}
                disabled={isAddingFile}
                className="flex items-center gap-3 px-3 py-2 rounded-md border-2 border-dashed border-border hover:border-primary hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingFile ? (
                  <>
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                    <span className="text-sm text-muted-foreground">Adding template...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Add new template...</span>
                  </>
                )}
              </motion.button>

              {/* Unsynced templates (new files) */}
              {unsyncedTemplates.map((template, index) => (
                <motion.div
                  key={`${template.filename}-unsynced`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted/50 bg-amber-500/10 border border-amber-500/30"
                >
                  <div className="relative flex-shrink-0">
                    <FileText className={`w-5 h-5 text-amber-600 dark:text-amber-400 ${template.landscape ? 'rotate-90' : ''}`} />
                    <CloudOff className="w-3 h-3 text-amber-500 absolute -top-1 -right-1" />
                  </div>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) => onUpdateTemplateName?.(template.filename, e.target.value)}
                    className="text-sm flex-1 bg-transparent border-b border-transparent hover:border-muted-foreground/30 focus:border-primary focus:outline-none px-1 py-0.5 -mx-1"
                    placeholder="Template name"
                  />
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 flex-shrink-0">
                    Not synced
                  </span>
                </motion.div>
              ))}

              {/* Divider between unsynced and synced */}
              {unsyncedTemplates.length > 0 && (syncedTemplates.length > 0 || deletionPendingTemplates.length > 0) && (
                <div className="flex items-center gap-2 py-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">On Device</span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              {/* Synced templates (on device) */}
              {syncedTemplates.map((template, index) => (
                <motion.div
                  key={`${template.filename}-${template.landscape ? 'l' : 'p'}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: (unsyncedTemplates.length + index) * 0.02 }}
                  className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedTemplates.has(template.filename)}
                    onCheckedChange={() => handleToggleSelection(template.filename)}
                    className="flex-shrink-0"
                  />
                  <FileText className={`w-5 h-5 flex-shrink-0 text-muted-foreground ${template.landscape ? 'rotate-90' : ''}`} />
                  <span className="text-sm flex-1">{template.name}</span>
                  {template.landscape && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Landscape
                    </span>
                  )}
                </motion.div>
              ))}

              {/* Deletion pending templates */}
              {deletionPendingTemplates.length > 0 && (
                <>
                  {syncedTemplates.length > 0 && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pending Deletion</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>
                  )}
                  {deletionPendingTemplates.map((template, index) => (
                    <motion.div
                      key={`${template.filename}-deletion`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: (unsyncedTemplates.length + syncedTemplates.length + index) * 0.02 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors hover:bg-muted/50 bg-red-500/10 border border-red-500/30"
                    >
                      <FileText className={`w-5 h-5 flex-shrink-0 text-red-600 dark:text-red-400 ${template.landscape ? 'rotate-90' : ''}`} />
                      <span className="text-sm flex-1 line-through text-muted-foreground">{template.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 flex-shrink-0">
                        Pending deletion
                      </span>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </ScrollArea>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleBackup} 
              variant="outline"
              className="flex-1 gap-2"
              size="sm"
              disabled={backupState !== "idle" || syncState !== "idle" || templates.length === 0}
            >
              <Download className="w-4 h-4" />
              Backup
            </Button>
            {selectedTemplates.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1"
              >
                <Button 
                  onClick={handleDeleteSelected}
                  variant="destructive"
                  className="w-full gap-2"
                  size="sm"
                  disabled={backupState !== "idle" || syncState !== "idle"}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedTemplates.size})
                </Button>
              </motion.div>
            )}
            {(unsyncedCount > 0 || deletionPendingCount > 0) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1"
              >
                <Button 
                  onClick={handleSyncClick}
                  className="w-full gap-2"
                  size="sm"
                  disabled={backupState !== "idle" || syncState !== "idle"}
                >
                  <Upload className="w-4 h-4" />
                  Sync ({unsyncedCount + deletionPendingCount})
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Template Dialog */}
      <DuplicateTemplateDialog
        open={duplicateName !== null}
        templateName={duplicateName ?? ""}
        onClose={() => setDuplicateName(null)}
      />

      <InvalidFilenameDialog
        open={invalidFilename !== null}
        filename={invalidFilename ?? ""}
        onClose={() => setInvalidFilename(null)}
      />
    </motion.div>
  );
};

export default TemplateList;
