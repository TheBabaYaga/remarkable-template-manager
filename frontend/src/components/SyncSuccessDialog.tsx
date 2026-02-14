import { CheckCircle, RefreshCw } from "lucide-react";
import BaseAlertDialog from "@/components/ui/base-alert-dialog";

interface SyncSuccessDialogProps {
  open: boolean;
  templateCount: number;
  onReboot: () => void;
  onClose: () => void;
}

const SyncSuccessDialog = ({
  open,
  templateCount,
  onReboot,
  onClose,
}: SyncSuccessDialogProps) => {
  return (
    <BaseAlertDialog
      open={open}
      variant="success"
      icon={CheckCircle}
      title="Sync Successful!"
      description={
        <>
          {templateCount} {templateCount === 1 ? "template has" : "templates have"} been uploaded to your device.
          <br /><br />
          Changes will only be reflected after rebooting the device. Would you like to reboot now?
        </>
      }
      primaryAction={{
        label: "Reboot Device",
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

export default SyncSuccessDialog;
