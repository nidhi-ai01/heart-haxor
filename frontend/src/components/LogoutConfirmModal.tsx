"use client";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function LogoutConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <p className="app-eyebrow">Confirm action</p>
        <h2 className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100">
          Sign out of Heart Haxor?
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">
          You will need to log in again before you can access your companion workspace and saved chats.
        </p>

        <div className="mt-8 flex gap-3">
          <Button onClick={onCancel} variant="outline" fullWidth>
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="danger" fullWidth>
            Sign out
          </Button>
        </div>
      </Card>
    </div>
  );
}
