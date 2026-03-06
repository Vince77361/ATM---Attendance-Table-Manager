"use client";

import { FormEvent, useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { Student } from "@/types";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

interface AddAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  students: Student[];
  defaultStudentId?: string;
}

const STATUS_OPTIONS = [
  {
    value: "attend",
    label: "출석",
    activeClass: "bg-green-600  text-white border-green-600",
  },
  {
    value: "absent_approved",
    label: "인정결석",
    activeClass: "bg-yellow-500 text-white border-yellow-500",
  },
  {
    value: "absent_unapproved",
    label: "미인정결석",
    activeClass: "bg-red-500  text-white border-red-500",
  },
] as const;

export function AddAttendanceModal({
  open,
  onOpenChange,
  onSuccess,
  students,
  defaultStudentId,
}: AddAttendanceModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] =
    useState<(typeof STATUS_OPTIONS)[number]["value"]>("attend");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const student = students.find((s) => s.id === defaultStudentId);
  const isAbsent = status !== "attend";

  useEffect(() => {
    if (open) {
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("attend");
      setNote("");
      setError("");
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!defaultStudentId) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: defaultStudentId,
        date,
        status,
        note: note || null,
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error);
      return;
    }

    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md focus:outline-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
            className="bg-white rounded-xl shadow-xl p-6"
          >
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-0.5">
              출석 기록 추가
            </Dialog.Title>
            {student && (
              <p className="text-sm text-blue-600 font-medium mb-4">
                {student.name}
              </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  날짜
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  출결 여부
                </label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatus(option.value);
                        if (option.value === "attend") setNote("");
                      }}
                      className={cn(
                        "flex-1 py-2 text-sm rounded-lg border transition-colors font-medium",
                        status === option.value
                          ? option.activeClass
                          : "border-gray-300 text-gray-600 hover:bg-gray-50",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  className={cn(
                    "block text-sm font-medium mb-1",
                    isAbsent ? "text-gray-700" : "text-gray-400",
                  )}
                >
                  사유 {!isAbsent && "(출석 시 비활성)"}
                </label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={!isAbsent}
                  rows={3}
                  placeholder={
                    isAbsent
                      ? "결석 사유를 입력하세요"
                      : "출석 상태에서는 비활성입니다"
                  }
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <Dialog.Close asChild>
                  <Button type="button" variant="ghost">
                    취소
                  </Button>
                </Dialog.Close>
                <Button type="submit" disabled={loading}>
                  {loading ? "추가 중..." : "추가"}
                </Button>
              </div>
            </form>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
