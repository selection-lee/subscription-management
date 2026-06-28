import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "../trpc.ts";
import { annualizedByCurrency, formatAmount, type Currency } from "../lib/subscription.ts";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

// KRW·JPY는 소수점 없는 통화 → 표시 전 반올림
const tidy = (currency: string, n: number) =>
  currency === "KRW" || currency === "JPY" ? Math.round(n) : n;

function StatsPage() {
  const trpc = useTRPC();
  const listQuery = useQuery(trpc.subscription.list.queryOptions({ status: "ACTIVE" }));
  const settingsQuery = useQuery(trpc.settings.get.queryOptions());

  const subs = listQuery.data ?? [];
  // decisions.md §0001 — 기준통화는 AppSetting.currency (KRW 하드코딩 금지)
  const base = (settingsQuery.data?.currency as Currency) ?? "KRW";

  const byCurrency = annualizedByCurrency(subs);
  const baseAnnual = byCurrency[base] ?? 0;
  const baseMonthly = baseAnnual / 12;
  const foreign = Object.entries(byCurrency)
    .filter(([c, v]) => c !== base && v > 0)
    .sort((a, b) => b[1] - a[1]);

  return (
    <Shell>
      <div className="flex items-center justify-between px-5 pb-3 pt-2">
        <Link
          to="/"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
        >
          ‹
        </Link>
        <span className="text-[15px] font-medium tracking-tight">통계</span>
        <div className="w-8" />
      </div>

      {listQuery.isPending ? (
        <p className="px-5 py-10 text-center text-sm text-white/30">불러오는 중...</p>
      ) : (
        <>
          <p className="px-5 pb-1 pt-1 text-[12px] text-white/35">
            활성 구독 {subs.length}개 기준
          </p>

          <div className="mx-5 mt-2 grid grid-cols-2 gap-3">
            <KpiCard label="연간 총지출" value={formatAmount(tidy(base, baseAnnual), base)} />
            <KpiCard label="월 평균" value={formatAmount(tidy(base, baseMonthly), base)} />
          </div>

          {foreign.length > 0 && (
            <div className="mx-5 mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4">
              <div className="mb-2.5 text-[11px] uppercase tracking-wider text-white/35">
                외화 구독 · 환산 미포함
              </div>
              <div className="space-y-2">
                {foreign.map(([c, v]) => (
                  <div key={c} className="flex items-center justify-between text-[13px]">
                    <span className="text-white/55">{c}</span>
                    <span className="font-medium text-white/80">
                      {formatAmount(tidy(c, v), c)} <span className="text-white/35">/ 년</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="px-6 pt-4 text-[11px] leading-relaxed text-white/25">
            * 기본 통화({base}) 기준 집계입니다.
            {foreign.length > 0 && " 외화 구독은 환율 적용 전이라 별도로 표기했습니다."}
          </p>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto max-w-md pt-3">{children}</div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-4">
      <div className="text-[22px] font-bold tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-white/35">{label}</div>
    </div>
  );
}
