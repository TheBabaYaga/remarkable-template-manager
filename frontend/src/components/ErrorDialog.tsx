import { AlertCircle } from "lucide-react";
import { ReactNode } from "react";
import BaseAlertDialog from "@/components/ui/base-alert-dialog";

interface ErrorDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  onClose: () => void;
}

const ErrorDialog = ({
  open,
  title,
  message,
  onClose,
}: ErrorDialogProps) => {
  return (
    <BaseAlertDialog
      open={open}
      variant="error"
      icon={AlertCircle}
      title={title}
      description={message}
      onClose={onClose}
    />
  );
};

export default ErrorDialog;
