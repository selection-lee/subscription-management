import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto max-w-md pt-3">
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <Link
            to="/settings"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
          >
            ‹
          </Link>
          <span className="text-[15px] font-medium tracking-tight">이용약관</span>
          <div className="w-8" />
        </div>
        <div className="px-6 pt-8 text-center">
          <p className="text-3xl">📄</p>
          <p className="mt-3 text-sm text-white/50">이용약관 준비 중입니다.</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/30">
            정식 약관은 추후 업데이트될 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
