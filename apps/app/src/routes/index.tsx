import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Subscription } from "@lib/schema";
import { useTRPC } from "../trpc.ts";
import {
  type SortKey,
  sortLabels,
  gradientForSubscription,
  daysUntil,
  dDayLabel,
  ddayClass,
  cycleLabel,
  formatAmount,
  formatDateKo,
  isInCurrentMonth,
  paymentAlerts,
} from "../lib/subscription.ts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const trpc = useTRPC();
  const navigate = useNavigate();

  const listQuery = useQuery(trpc.subscription.list.queryOptions({ status: "ACTIVE" }));

  const [sortKey, setSortKey] = useState<SortKey>("date");

  const subscriptions = listQuery.data ?? [];
  const isLoading = listQuery.isPending;

  const sorted = useMemo(() => {
    const arr = [...subscriptions];
    if (sortKey === "date") {
      arr.sort(
        (a, b) =>
          new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime(),
      );
    } else if (sortKey === "name") {
      arr.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    } else {
      arr.sort((a, b) => Number(b.amount ?? 0) - Number(a.amount ?? 0));
    }
    return arr;
  }, [subscriptions, sortKey]);

  const monthTotal = useMemo(
    () =>
      subscriptions
        .filter((s) => isInCurrentMonth(s.nextPaymentDate) && s.currency === "KRW")
        .reduce((acc, s) => acc + Number(s.amount ?? 0), 0),
    [subscriptions],
  );

  const notifQuery = useQuery(trpc.notification.get.queryOptions());
  const alertCount = useMemo(() => {
    if (notifQuery.data?.enabled === false) return 0;
    return paymentAlerts(subscriptions, notifQuery.data?.daysBefore ?? 1).length;
  }, [subscriptions, notifQuery.data]);

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto flex min-h-screen max-w-md flex-col">
        <header className="flex items-center justify-between px-5 pb-2 pt-5">
          <div>
            <div className="text-[13px] text-white/40">안녕하세요 👋</div>
            <div className="mt-0.5 text-[22px] font-bold tracking-tight">내 구독</div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/stats"
              title="통계"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] text-sm"
            >
              📊
            </Link>
            <Link
              to="/archive"
              title="아카이브"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] text-sm"
            >
              🗃
            </Link>
            <Link
              to="/settings"
              title="설정"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] text-sm"
            >
              ⚙️
            </Link>
          </div>
        </header>

        <div className="mx-5 mb-4 mt-2 flex items-center justify-between rounded-2xl border border-[rgba(74,58,255,0.22)] bg-[rgba(74,58,255,0.1)] px-4 py-3.5">
          <SummaryCell value={formatAmount(monthTotal, "KRW")} label="이번 달 결제" />
          <div className="h-8 w-px bg-[rgba(74,58,255,0.35)]" />
          <SummaryCell value={`${subscriptions.length}개`} label="활성 구독" />
          <div className="h-8 w-px bg-[rgba(74,58,255,0.35)]" />
          <Link to="/alerts" className="text-center active:opacity-70">
            <SummaryCell value={`${alertCount}건`} label="결제 알림" />
          </Link>
        </div>

        <div className="flex items-center justify-between px-5 pb-3">
          <span className="text-xs font-medium text-white/50">활성 구독</span>
          <SortDropdown value={sortKey} onChange={setSortKey} />
        </div>

        <div className="flex-1 px-4 pb-28">
          {isLoading ? (
            <p className="px-1 py-8 text-center text-sm text-white/30">불러오는 중...</p>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-3xl">📭</p>
              <p className="mt-2 text-sm text-white/50">등록된 구독이 없습니다.</p>
              <p className="text-xs text-white/30">우측 하단 + 버튼으로 추가해보세요.</p>
            </div>
          ) : (
            sorted.map((s) => <SubscriptionCard key={s.id} subscription={s} />)
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate({ to: "/subscription/new" })}
        className="fixed bottom-6 right-[max(1.5rem,calc(50%-13rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#4a3aff] text-3xl font-light leading-none text-white shadow-[0_4px_20px_rgba(74,58,255,0.5)] active:scale-95"
        aria-label="새 구독 추가"
      >
        +
      </button>
    </div>
  );
}

function SummaryCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold tracking-tight">{value}</div>
      <div className="mt-0.5 text-[10px] text-white/35">{label}</div>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 whitespace-nowrap rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[11px] text-white/40"
      >
        <span>≡</span>
        <span>{sortLabels[value]}</span>
        <span className="text-[9px] opacity-50">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-[130px] rounded-xl border border-white/10 bg-[#1e1e2e] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
          {(Object.keys(sortLabels) as SortKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs hover:bg-white/[0.06] ${
                value === key ? "text-[#8b7fff]" : "text-white/65"
              }`}
            >
              {sortLabels[key]}
              {value === key && <span className="text-[11px] text-[#8b7fff]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  const dl = dDayLabel(daysUntil(subscription.nextPaymentDate));

  return (
    <Link
      to="/subscription/$id"
      params={{ id: subscription.id }}
      className="mb-2.5 block rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3.5 pb-3 pt-3.5 active:scale-[0.99]"
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
          style={{ background: gradientForSubscription(subscription) }}
        >
          {subscription.icon ?? "✨"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold tracking-tight">
            {subscription.name}
          </div>
          <div className="mt-0.5 text-[11px] text-white/35">
            {cycleLabel(subscription.cycleUnit, subscription.cycleInterval)} 결제
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="text-[17px] font-bold tracking-tight">
            {formatAmount(subscription.amount, subscription.currency)}
          </div>
          <div className="text-[10px] font-normal text-white/30">
            /{cycleLabel(subscription.cycleUnit, subscription.cycleInterval)}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[11px] text-white/35">
          다음 결제 · {formatDateKo(subscription.nextPaymentDate)}
        </span>
        <span className={`rounded-lg px-2.5 py-[3px] text-[11px] font-semibold ${ddayClass[dl.cls]}`}>
          {dl.text}
        </span>
      </div>
    </Link>
  );
}

