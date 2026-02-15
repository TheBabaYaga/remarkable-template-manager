import { CheckCircle } from "lucide-react";
import BaseAlertDialog from "@/components/ui/base-alert-dialog";

interface BackupSuccessDialogProps {
  open: boolean;
  filePath: string;
  sizeBytes: number;
  onClose: () => void;
}

const BackupSuccessDialog = ({
  open,
  filePath,
  sizeBytes,
  onClose,
}: BackupSuccessDialogProps) => {
  // Format file size for display
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Extract just the filename from the full path
  const fileName = filePath.split("/").pop() || filePath.split("\\").pop() || filePath;

  return (
    <BaseAlertDialog
      open={open}
      variant="success"
      icon={CheckCircle}
      title="Backup Successful!"
      description={
        <>
          Your templates have been backed up successfully.
          <br /><br />
          <strong>File:</strong> {fileName}
          <br />
          <strong>Size:</strong> {formatSize(sizeBytes)}
          <br />
          <strong>Location:</strong> {filePath}
        </>
      }
      primaryAction={{
        label: "Close",
        onClick: onClose,
      }}
      onClose={onClose}
    />
  );
};

export default BackupSuccessDialog;
