import { useLanguage } from '@/contexts/LanguageContext';
import Button from './shared/Button';
import Dialog from './shared/Dialog';

interface ConfirmDialogProps {
  open: boolean;
  /** Header text — phrase it as the question being asked. */
  label: string;
  /** The consequence, spelled out. */
  message: string;
  confirmText: string;
  /** Styles the confirm button as destructive. */
  danger?: boolean;
  /** Keeps the dialog up with both buttons disabled while the action runs. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal replacement for `window.confirm`, used before destructive actions.
function ConfirmDialog({
  open,
  label,
  message,
  confirmText,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog
      open={open}
      label={label}
      onWaHide={onCancel}
    >
      <p className="text-sm text-hot-gray-700">{message}</p>

      <div slot="footer" className="flex justify-end gap-2">
        <Button appearance="plain" onClick={onCancel} disabled={busy}>
          {t('cancel')}
        </Button>
        <Button
          appearance="outlined"
          variant='danger'
          onClick={onConfirm}
          disabled={busy}
        >
          {busy ? t('saving') : confirmText}
        </Button>
      </div>
    </Dialog>
  );
}

export default ConfirmDialog;
