"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui";
import { Button } from "@/components/ui";

interface NoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  statusLabel: string;
  initialNote?: string;
  onSave: (note: string) => Promise<void>;
}

export function NoteModal({
  open,
  onOpenChange,
  studentName,
  statusLabel,
  initialNote = "",
  onSave,
}: NoteModalProps) {
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setNote(initialNote);
  }, [open, initialNote]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(note);
    setLoading(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm focus:outline-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-xl shadow-xl p-5"
          >
            <Dialog.Title className="text-sm font-semibold text-gray-900 mb-0.5">
              결석 사유 입력
            </Dialog.Title>
            <p className="text-xs text-gray-400 mb-4">
              {studentName} · <span className="font-medium">{statusLabel}</span>
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                autoFocus
                placeholder="결석 사유를 입력하세요 (선택)"
              />
              <div className="flex justify-end gap-2">
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost" size="sm">
                    취소
                  </Button>
                </Dialog.Close>
                <Button type="submit" size="sm" disabled={loading}>
                  {loading ? "저장 중..." : "저장"}
                </Button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
