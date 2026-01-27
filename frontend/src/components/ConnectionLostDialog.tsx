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
import { WifiOff, RefreshCw, Unplug, Loader2 } from "lucide-react";

interface ConnectionLostDialogProps {
  open: boolean;
  onRetry: () => void;
  onDisconnect: () => void;
  isRetrying?: boolean;
}

const ConnectionLostDialog = ({ open, onRetry, onDisconnect, isRetrying = false }: ConnectionLostDialogProps) => {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <WifiOff className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle>Connection Lost</AlertDialogTitle>
          <AlertDialogDescription>
            The connection to your reMarkable device has been lost. Would you like to retry or disconnect?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel onClick={onDisconnect} className="gap-2" disabled={isRetrying}>
            <Unplug className="h-4 w-4" />
            Disconnect
          </AlertDialogCancel>
          <AlertDialogAction onClick={onRetry} className="gap-2" disabled={isRetrying}>
            {isRetrying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isRetrying ? "Retrying..." : "Retry"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConnectionLostDialog;
