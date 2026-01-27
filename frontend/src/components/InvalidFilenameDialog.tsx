import ErrorDialog from "@/components/ErrorDialog";

interface InvalidFilenameDialogProps {
  open: boolean;
  filename: string;
  onClose: () => void;
}

const InvalidFilenameDialog = ({
  open,
  filename,
  onClose,
}: InvalidFilenameDialogProps) => {
  return (
    <ErrorDialog
      open={open}
      title="Invalid Filename"
      message={
        <>
          The filename "<span className="font-medium text-foreground">{filename}</span>" contains invalid characters.
          <br /><br />
          Template filenames cannot contain spaces or special characters (except <code className="px-1 py-0.5 bg-muted rounded">-</code> and <code className="px-1 py-0.5 bg-muted rounded">_</code>).
          <br /><br />
          Please rename the file and try again.
        </>
      }
      onClose={onClose}
    />
  );
};

export default InvalidFilenameDialog;
