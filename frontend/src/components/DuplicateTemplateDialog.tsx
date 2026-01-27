import ErrorDialog from "@/components/ErrorDialog";

interface DuplicateTemplateDialogProps {
  open: boolean;
  templateName: string;
  onClose: () => void;
}

const DuplicateTemplateDialog = ({
  open,
  templateName,
  onClose,
}: DuplicateTemplateDialogProps) => {
  return (
    <ErrorDialog
      open={open}
      title="Duplicate Template"
      message={
        <>
          A template named "<span className="font-medium text-foreground">{templateName}</span>" already exists. 
          Please choose a different filename.
        </>
      }
      onClose={onClose}
    />
  );
};

export default DuplicateTemplateDialog;
