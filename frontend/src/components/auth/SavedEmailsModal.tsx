"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { X } from "lucide-react";

type SavedEmailsModalProps = {
  isOpen: boolean;
  emails: string[];
  onClose: () => void;
  onSelect: (email: string) => void;
};

export default function SavedEmailsModal({
  isOpen,
  emails,
  onClose,
  onSelect,
}: SavedEmailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Saved emails"
    >
      <Card className="relative w-full max-w-md p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-slate-100"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Continue with saved email</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Pick an email to fill the field. You’ll still enter your password.
        </p>
        <ul className="mt-4 max-h-56 space-y-2 overflow-y-auto">
          {emails.map((e) => (
            <li key={e}>
              <button
                type="button"
                onClick={() => {
                  onSelect(e);
                  onClose();
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-left text-sm font-medium text-slate-800 hover:border-blue-300 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-blue-400/40"
              >
                {e}
              </button>
            </li>
          ))}
        </ul>
        <Button type="button" variant="ghost" fullWidth className="mt-4" onClick={onClose}>
          Cancel
        </Button>
      </Card>
    </div>
  );
}
