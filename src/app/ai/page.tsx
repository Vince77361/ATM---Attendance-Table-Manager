"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Student } from "@/types";
import { ChevronDown, Loader2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { Textarea, Button } from "@/components/ui";

type ClassifyResult = {
  result: "인정결석" | "미인정결석";
  confidence: number;
  reason: string;
  suggestion: string;
};

type HistoryItem = {
  id: number;
  studentName: string;
  absenceReason: string;
  result: ClassifyResult;
};

export default function AiClassifierPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassifyResult | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setStudents(json.data);
      });
  }, []);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch("/api/ai/classify-absence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentName: selectedStudent?.name || "",
        absenceReason,
      }),
    });
    const json = await res.json();
    setLoading(false);

    if (!json.success) {
      setError(json.error);
      return;
    }

    setResult(json.data);
    setHistory((prev) => [
      {
        id: nextId,
        studentName: selectedStudent?.name || "(미선택)",
        absenceReason,
        result: json.data,
      },
      ...prev,
    ]);
    setNextId((n) => n + 1);
  };

  const isApproved = result?.result === "인정결석";

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm text-gray-500 mb-4">
                학생이 제출한 결석 사유를 입력하면 AI가 인정결석/미인정결석
                여부를 판단합니다.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    학생 선택 (선택)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      className="w-full appearance-none text-neutral-500 pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">학생 선택 안함</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    결석 사유
                  </label>
                  <Textarea
                    value={absenceReason}
                    onChange={(e) => setAbsenceReason(e.target.value)}
                    required
                    rows={5}
                    placeholder="예: 어제부터 38도 넘는 고열이 나서 병원에 다녀왔습니다. 독감 진단을 받았습니다."
                    className="focus:ring-purple-500"
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading || !absenceReason.trim()}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      판별 중...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AI 판별 시작
                    </>
                  )}
                </Button>
              </form>
            </div>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={nextId - 1}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className={`border rounded-xl p-5 ${isApproved ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {isApproved ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span
                      className={`text-lg font-bold ${isApproved ? "text-green-800" : "text-red-800"}`}
                    >
                      {result.result}
                    </span>
                    <span
                      className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      확신도 {result.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-white/60 rounded-full h-1.5 mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${result.confidence}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-1.5 rounded-full ${isApproved ? "bg-green-500" : "bg-red-500"}`}
                    />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        판단 근거
                      </p>
                      <p className="text-sm text-gray-700">{result.reason}</p>
                    </div>
                    <div
                      className={`border-t pt-3 ${isApproved ? "border-green-200" : "border-red-200"}`}
                    >
                      <p className="text-xs font-medium text-gray-500 mb-1">
                        학부모/학생 안내 문구
                      </p>
                      <p
                        className={`text-sm italic ${isApproved ? "text-green-800" : "text-red-800"}`}
                      >
                        &ldquo;{result.suggestion}&rdquo;
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              판별 이력{" "}
              <span className="text-gray-400 font-normal">
                ({history.length}건)
              </span>
            </h2>
            {history.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                판별 결과가 여기에 쌓입니다.
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">
                        {item.studentName}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.result.result === "인정결석" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {item.result.result}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.absenceReason}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <div className="flex-1 bg-gray-100 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${item.result.result === "인정결석" ? "bg-green-400" : "bg-red-400"}`}
                          style={{ width: `${item.result.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        {item.result.confidence}%
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
