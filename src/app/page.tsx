"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtimeListener } from "@/hooks";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Student, AttendanceRecord } from "@/types";
import { NoteModal } from "@/components/modals";
import { ChevronLeft, ChevronRight, Users, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDisplay, toDateStr, addDays, isToday } from "@/lib/utils";
import toast from "react-hot-toast";
import { taintObjectReference } from "next/dist/server/app-render/entry-base";

// ─── status config ───────────────────────────────────────────────────────────

const STATUS = [
  {
    value: "attend",
    label: "출석",
    activeClass: "bg-green-500  text-white border-green-500",
  },
  {
    value: "absent_approved",
    label: "인정결석",
    activeClass: "bg-yellow-400 text-white border-yellow-400",
  },
  {
    value: "absent_unapproved",
    label: "미인정",
    activeClass: "bg-red-500 text-white border-red-500",
  },
];

type StatusValue = (typeof STATUS)[number]["value"];

// ─── slide variants ──────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "60%" : "-60%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? "-60%" : "60%", opacity: 0 }),
};

// ─── component ───────────────────────────────────────────────────────────────

type NoteTarget = {
  student: Student;
  status: StatusValue;
  existingRecord?: AttendanceRecord;
};

export default function DashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [date, setDate] = useState(() => new Date());
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [noteTarget, setNoteTarget] = useState<NoteTarget | null>(null);

  const pendingRef = useRef(false);

  // 나중에 Suspense로 고칠듯
  const fetchRecords = useCallback(async (d: Date) => {
    setLoading(true);
    const res = await fetch(`/api/attendance?date=${toDateStr(d)}`);
    const json = await res.json();
    if (json.success) setRecords(json.data);
    setLoading(false);
  }, []);

  const refreshRecords = useCallback(async (d: Date) => {
    const res = await fetch(`/api/attendance?date=${toDateStr(d)}`);
    const json = await res.json();
    if (json.success) setRecords(json.data);
  }, []);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    const json = await res.json();
    if (json.success) setStudents(json.data);
  }, []);

  const [recordsTick, setRecordsTick] = useState(0);
  const [studentsTick, setStudentsTick] = useState(0);

  useRealtimeListener(
    "attendance_records",
    useCallback(() => setRecordsTick((n) => n + 1), []),
  );
  useRealtimeListener(
    "students",
    useCallback(() => setStudentsTick((n) => n + 1), []),
  );

  // 날짜 변경: 이전 레코드 즉시 클리어 후 로딩 표시하며 fetch
  useEffect(() => {
    setRecords([]);
    fetchRecords(date);
    router.refresh();
  }, [date, fetchRecords]);

  // 리얼타임 이벤트: 현재 날짜 기준으로 조용히 갱신 (loading 없음)
  useEffect(() => {
    if (recordsTick === 0) return;
    refreshRecords(date);
  }, [recordsTick, date, refreshRecords]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents, studentsTick]);

  // layout의 DashboardHeader에서 학생 추가 시 CustomEvent로 알림
  useEffect(() => {
    const handler = () => fetchStudents();
    window.addEventListener("students-updated", handler);
    return () => window.removeEventListener("students-updated", handler);
  }, [fetchStudents]);

  // ── navigation ──

  const go = (delta: number) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setTimeout(() => {
      pendingRef.current = false;
    }, 300);
    setDirection(delta);
    setDate((d) => addDays(d, delta));
  };

  const goToday = () => {
    const diff = Math.sign(new Date().getTime() - date.getTime());
    setDirection(diff || 1);
    setDate(new Date());
  };

  // ── status actions ──

  const recordOf = (studentId: string) =>
    records.find((r) => r.student_id === studentId);

  const handleStatusClick = async (student: Student, status: StatusValue) => {
    const existing = recordOf(student.id);

    // toggle off
    if (existing?.status === status) {
      await fetch(`/api/attendance/${existing.id}`, { method: "DELETE" });
      await fetchRecords(date);
      return;
    }

    // attend: save immediately
    if (status === "attend") {
      if (existing) {
        await fetch(`/api/attendance/${existing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "attend", note: null }),
        });
      } else {
        await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student.id,
            date: toDateStr(date),
            status: "attend",
            note: null,
          }),
        });
      }
      await fetchRecords(date);
      return;
    }

    // absence: open note modal
    setNoteTarget({ student, status, existingRecord: existing });
  };

  const handleNoteSave = async (note: string) => {
    if (!noteTarget) return;
    try {
      const { student, status, existingRecord } = noteTarget;
      if (existingRecord) {
        await fetch(`/api/attendance/${existingRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status, note: note || null }),
        });
      } else {
        await fetch("/api/attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: student.id,
            date: toDateStr(date),
            status,
            note: note || null,
          }),
        });
      }
      setNoteTarget(null);
      await fetchRecords(date);
      toast.success("성공적으로 수정했습니다!");
    } catch (err) {
      toast.error("수정에 실패하였습니다.");
      console.error(err);
    }
  };

  const handleDelete = async (record: AttendanceRecord) => {
    try {
      await fetch(`/api/attendance/${record.id}`, { method: "DELETE" });
      await fetchRecords(date);
      toast.success("성공적으로 삭제했습니다!");
    } catch (err) {
      toast.error("삭제에 실패하였습니다.");
      console.error(err);
    }
  };

  // ── summary ──
  const attendCount = records.filter((r) => r.status === "attend").length;
  const approvedCount = records.filter(
    (r) => r.status === "absent_approved",
  ).length;
  const unapprovedCount = records.filter(
    (r) => r.status === "absent_unapproved",
  ).length;
  const unrecordedCount = students.length - records.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── 날짜 이동 섹션 ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[53px] z-20">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => go(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <p className="text-base font-bold text-gray-900">
                {formatDisplay(date)}
              </p>
              {!isToday(date) && (
                <button
                  onClick={goToday}
                  className="text-xs text-blue-500 hover:underline mt-0.5"
                >
                  오늘로
                </button>
              )}
            </div>

            <button
              onClick={() => go(1)}
              className="p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors text-gray-500"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* 출석 현황 */}
          <div className="flex items-center justify-center gap-3 mt-2 text-xs text-gray-900">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
              출석 {attendCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
              인정결석 {approvedCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
              미인정 {unapprovedCount}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 inline-block" />
              미기록 {unrecordedCount}
            </span>
          </div>
        </div>
      </div>

      {/* ── student list ── */}
      <main className="max-w-2xl mx-auto px-4 py-4">
        {students.length === 0 && !loading ? (
          <div className="text-center py-20 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">등록된 학생이 없습니다.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={toDateStr(date)}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="space-y-2"
            >
              {loading
                ? Array.from({ length: students.length || 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-[72px] bg-white border border-gray-100 rounded-2xl animate-pulse"
                    />
                  ))
                : students.map((student) => {
                    const record = recordOf(student.id);
                    return (
                      <div
                        key={student.id}
                        className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          {/* name */}
                          <Link
                            href={`/students/${student.id}`}
                            className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors min-w-0 truncate"
                          >
                            {student.name}
                          </Link>

                          {/* status buttons + delete */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {STATUS.map((s) => (
                              <button
                                key={s.value}
                                onClick={() =>
                                  handleStatusClick(student, s.value)
                                }
                                className={`px-2.5 py-1 text-xs rounded-full border transition-all font-medium ${
                                  record?.status === s.value
                                    ? s.activeClass
                                    : "border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-600"
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                            {record && (
                              <button
                                onClick={() => handleDelete(record)}
                                className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* 사유(note) */}
                        {record?.note && (
                          <p className="mt-1 text-xs text-gray-400 pl-0.5">
                            사유: {record.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <NoteModal
        open={!!noteTarget}
        onOpenChange={(open) => {
          if (!open) setNoteTarget(null);
        }}
        studentName={noteTarget?.student.name ?? ""}
        statusLabel={
          STATUS.find((s) => s.value === noteTarget?.status)?.label ?? ""
        }
        initialNote={noteTarget?.existingRecord?.note ?? ""}
        onSave={handleNoteSave}
      />
    </div>
  );
}
