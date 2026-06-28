import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
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
          <span className="text-[15px] font-medium tracking-tight">개인정보처리방침</span>
          <div className="w-8" />
        </div>
        <div className="px-6 pt-8 text-center">
          <p className="text-3xl">🔒</p>
          <p className="mt-3 text-sm text-white/50">개인정보처리방침 준비 중입니다.</p>
          <p className="mt-1 text-[12px] leading-relaxed text-white/30">
            현재 모든 데이터는 로그인 없이 로컬에만 저장되며,
            <br />
            외부로 전송되지 않습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
