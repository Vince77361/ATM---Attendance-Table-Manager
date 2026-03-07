import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";

export function AiHeader() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h1 className="text-xl font-bold text-gray-900">결석 사유 AI 판별</h1>
      </div>
    </header>
  );
}
