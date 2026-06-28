import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { Subscription } from "@lib/schema";
import { useTRPC } from "../trpc.ts";
import {
  paymentAlerts,
  alertLabel,
  alertClass,
  gradientForSubscription,
  formatAmount,
  formatDateKo,
} from "../lib/subscription.ts";

export const Route = createFileRoute("/alerts")({
  component: AlertsPage,
});

function AlertsPage() {
  const trpc = useTRPC();
  const listQuery = useQuery(trpc.subscription.list.queryOptions({ status: "ACTIVE" }));
  const notifQuery = useQuery(trpc.notification.get.queryOptions());

  const subs = listQuery.data ?? [];
  const enabled = notifQuery.data?.enabled ?? true;
  const daysBefore = notifQuery.data?.daysBefore ?? 1;
  const alerts = enabled ? paymentAlerts(subs, daysBefore) : [];

  const loading = listQuery.isPending || notifQuery.isPending;

  return (
    <Shell>
      <div className="flex items-center justify-between px-5 pb-3 pt-2">
        <Link
          to="/"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
        >
          ‹
        </Link>
        <span className="text-[15px] font-medium tracking-tight">결제 알림</span>
        <Link
          to="/settings"
          title="알림 설정"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
        >
          ⚙️
        </Link>
      </div>

      <div className="px-4 pt-1">
        {loading ? (
          <p className="py-10 text-center text-sm text-white/30">불러오는 중...</p>
        ) : !enabled ? (
          <EmptyCard
            emoji="🔕"
            title="알림이 꺼져 있습니다"
            desc="설정에서 결제 알림을 켜면 다가오는 결제를 알려드립니다."
            action={
              <Link to="/settings" className="mt-3 inline-block text-sm text-[#8b7fff]">
                설정으로 이동 →
              </Link>
            }
          />
        ) : alerts.length === 0 ? (
          <EmptyCard emoji="✅" title="확인할 결제가 없습니다" desc="다가오는 결제일이 없어요." />
        ) : (
          <>
            <p className="px-1 pb-3 text-[11px] text-white/30">
              결제일이 지났거나 임박한 구독입니다.
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
              {alerts.map((a, i) => (
                <AlertRow
                  key={a.subscription.id}
                  subscription={a.subscription}
                  days={a.days}
                  last={i === alerts.length - 1}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}

function AlertRow({
  subscription: s,
  days,
  last,
}: {
  subscription: Subscription;
  days: number;
  last: boolean;
}) {
  const label = alertLabel(days);
  return (
    <Link
      to="/subscription/$id"
      params={{ id: s.id }}
      className={`flex items-center gap-3 px-3.5 py-3.5 active:bg-white/[0.03] ${
        last ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl"
        style={{ background: gradientForSubscription(s) }}
      >
        {s.icon ?? "✨"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold tracking-tight">{s.name}</div>
        <div className="mt-0.5 text-[11px] text-white/35">
          {formatDateKo(s.nextPaymentDate)} · {formatAmount(s.amount, s.currency)}
        </div>
      </div>
      <span
        className={`flex-shrink-0 rounded-lg px-2.5 py-[3px] text-[11px] font-semibold ${alertClass[label.cls]}`}
      >
        {label.text}
      </span>
    </Link>
  );
}

function EmptyCard({
  emoji,
  title,
  desc,
  action,
}: {
  emoji: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
      <p className="text-3xl">{emoji}</p>
      <p className="mt-2 text-sm text-white/50">{title}</p>
      <p className="text-xs text-white/30">{desc}</p>
      {action}
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto max-w-md pt-3">{children}</div>
    </div>
  );
}
