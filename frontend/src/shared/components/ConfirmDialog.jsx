/**
 * ConfirmDialog.jsx – Confirmation modal component.
 *
 * Props:
 *   - isOpen: boolean
 *   - onClose: function
 *   - onConfirm: function
 *   - title: string
 *   - message: string
 *   - confirmLabel: string (default 'Confirm')
 *   - cancelLabel: string (default 'Cancel')
 *   - variant: 'primary' | 'danger'
 */

import React from "react";
import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {message && (
        <p className="text-sm text-slate-600 mb-6">{message}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
