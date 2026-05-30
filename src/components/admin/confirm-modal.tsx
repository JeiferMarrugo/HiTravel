"use client";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  detail?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  tone?: "default" | "warning";
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({
  isOpen,
  title,
  description,
  detail,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  tone = "default",
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  const confirmClass =
    tone === "warning"
      ? "bg-amber-700 hover:bg-amber-800"
      : "bg-primary hover:bg-primary/90";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
        className="w-full max-w-md rounded-[2rem] bg-white p-6 coastal-shadow"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${
            tone === "warning" ? "bg-amber-100 text-amber-800" : "bg-secondary-container text-primary"
          }`}
        >
          <span className="material-symbols-outlined text-[28px]">
            {tone === "warning" ? "beach_access" : "help"}
          </span>
        </div>

        <h2 id="confirm-modal-title" className="text-xl font-semibold text-primary">
          {title}
        </h2>
        <p id="confirm-modal-desc" className="mt-3 text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>
        {detail ? (
          <p className="mt-3 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
            {detail}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-outline-variant/30 px-4 py-2.5 text-sm font-semibold text-on-surface-variant disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60 ${confirmClass}`}
          >
            {isLoading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
