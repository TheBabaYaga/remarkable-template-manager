import { CheckCircle, RefreshCw } from "lucide-react";
import BaseAlertDialog from "@/components/ui/base-alert-dialog";

interface RestoreSuccessDialogProps {
  open: boolean;
  filesRestored: number;
  backupLocation: string;
  sizeBytes: number;
  onReboot: () => void;
  onClose: () => void;
}

const RestoreSuccessDialog = ({
  open,
  filesRestored,
  backupLocation,
  sizeBytes,
  onReboot,
  onClose,
}: RestoreSuccessDialogProps) => {
  // Format file size for display
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  return (
    <BaseAlertDialog
      open={open}
      variant="success"
      icon={CheckCircle}
      title="Restore Successful!"
      description={
        <>
          Your templates have been restored successfully.
          <br /><br />
          <strong>Files Restored:</strong> {filesRestored}
          <br />
          <strong>Total Size:</strong> {formatSize(sizeBytes)}
          {backupLocation && (
            <>
              <br />
              <strong>Old Templates Backed Up At:</strong>
              <br />
              <span className="text-xs text-muted-foreground">{backupLocation}</span>
            </>
          )}
          <br /><br />
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <strong className="text-yellow-800 dark:text-yellow-200">Important:</strong>
            <span className="text-yellow-700 dark:text-yellow-300"> Please restart your reMarkable tablet to ensure the restored templates are loaded correctly.</span>
          </div>
        </>
      }
      primaryAction={{
        label: "Restart Now",
        onClick: onReboot,
        icon: RefreshCw,
      }}
      secondaryAction={{
        label: "Later",
        onClick: onClose,
      }}
      onClose={onClose}
    />
  );
};

export default RestoreSuccessDialog;
