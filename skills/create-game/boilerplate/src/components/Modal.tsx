import { useEffect, useRef, type ReactNode } from "react";
import "./Modal.css";

interface Props {
  title?: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement;
    const dialog = dialogRef.current;
    if (!dialog) return;

    dialog.showModal();

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();

    function onCancel(e: Event) {
      e.preventDefault();
      onClose();
    }

    dialog.addEventListener("cancel", onCancel);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      triggerRef.current?.focus();
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="modal-panel"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {title && (
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
        </div>
      )}
      <div className="modal-body">{children}</div>
    </dialog>
  );
}
