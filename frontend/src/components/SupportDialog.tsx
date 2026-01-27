import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SupportDialogProps {
  open: boolean;
  onClose: () => void;
}

const SupportDialog = ({ open, onClose }: SupportDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Support This Project</DialogTitle>
          <DialogDescription className="text-base leading-relaxed pt-2">
            I'm building this tool openly and keeping it free for everyone.
            Your support helps cover time and costs so I can keep adding features and maintaining it. 💛
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center py-4">
          <img 
            src="./support-qr.png" 
            alt="Support QR Code" 
            className="w-64 h-64 rounded-lg"
            onError={(e) => {
              console.error("Failed to load QR code image");
              // Try alternative path
              (e.target as HTMLImageElement).src = "/support-qr.png";
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
