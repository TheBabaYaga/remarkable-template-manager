import { WifiOff, RefreshCw, Unplug } from "lucide-react";
import BaseAlertDialog from "@/components/ui/base-alert-dialog";

interface ConnectionLostDialogProps {
  open: boolean;
  onRetry: () => void;
  onDisconnect: () => void;
  isRetrying?: boolean;
}

const ConnectionLostDialog = ({ open, onRetry, onDisconnect, isRetrying = false }: ConnectionLostDialogProps) => {
  return (
    <BaseAlertDialog
      open={open}
      variant="error"
      icon={WifiOff}
      title="Connection Lost"
      description="The connection to your reMarkable device has been lost. Would you like to retry or disconnect?"
      primaryAction={{
        label: isRetrying ? "Retrying..." : "Retry",
        onClick: onRetry,
        icon: RefreshCw,
        loading: isRetrying,
        disabled: isRetrying,
      }}
      secondaryAction={{
        label: "Disconnect",
        onClick: onDisconnect,
        icon: Unplug,
        disabled: isRetrying,
      }}
      onClose={onDisconnect}
      closeOnOverlayClick={false}
    />
  );
};

export default ConnectionLostDialog;
