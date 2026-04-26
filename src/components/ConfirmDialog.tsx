import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '確認',
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleCancel = (e: Event) => {
      e.preventDefault();
      onCancel();
    };
    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-2xl p-0 shadow-2xl backdrop:bg-black/60 bg-gray-900 border border-gray-700 w-full max-w-sm inset-0 m-auto"
      onClick={(e) => {
        if (e.target === dialogRef.current) onCancel();
      }}
    >
      {open && (
        <div className="p-6 flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-100">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
          <div className="flex gap-3 justify-end mt-2">
            <button
              className="px-4 py-2 rounded-lg bg-gray-700 text-white text-sm hover:bg-gray-600 transition-colors cursor-pointer"
              onClick={onCancel}
            >
              取消
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
