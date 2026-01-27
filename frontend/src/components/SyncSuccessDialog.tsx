import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CheckCircle, RefreshCw } from "lucide-react";

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
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <CheckCircle className="w-6 h-6 text-primary" />
          </div>
          <AlertDialogTitle>Sync Successful!</AlertDialogTitle>
          <AlertDialogDescription>
            {templateCount} {templateCount === 1 ? "template has" : "templates have"} been uploaded to your device.
            <br /><br />
            Changes will only be reflected after rebooting the device. Would you like to reboot now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={onClose}>
            Later
          </AlertDialogCancel>
          <AlertDialogAction onClick={onReboot} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Reboot Device
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SyncSuccessDialog;
