"use client";

import * as React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isLoading = false,
  variant = "danger",
}: ConfirmationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          {variant === "danger" && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl flex-shrink-0">
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-[#6B6B6B] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[rgba(0,0,0,0.06)]">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs uppercase tracking-wider font-bold"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            type="button"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className="text-xs uppercase tracking-wider font-bold"
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
