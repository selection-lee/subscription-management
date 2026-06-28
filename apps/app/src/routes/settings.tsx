import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc.ts";
import { currencyOptions, type Currency } from "../lib/subscription.ts";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const currencyLabels: Record<Currency, string> = {
  KRW: "₩ 원",
  USD: "$ 달러",
  EUR: "€ 유로",
  JPY: "¥ 엔",
};

type DefaultView = "subscription" | "stats" | "alerts";
const defaultViewOptions: { value: DefaultView; label: string }[] = [
  { value: "subscription", label: "구독 목록" },
  { value: "stats", label: "통계" },
  { value: "alerts", label: "알림" },
];

const timeOptions = ["08:00", "09:00", "10:00", "18:00"].map((t) => ({ value: t, label: t }));

function SettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // 저장 직후 토스트 ("저장됨 ✓") — tick을 올려 매 저장마다 타이머 리셋
  const [savedTick, setSavedTick] = useState(0);
  useEffect(() => {
    if (savedTick === 0) return;
    const t = setTimeout(() => setSavedTick(0), 1500);
    return () => clearTimeout(t);
  }, [savedTick]);

  const settingsQuery = useQuery(trpc.settings.get.queryOptions());
  const updateMutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.settings.get.queryKey() });
        setSavedTick((n) => n + 1);
      },
    }),
  );

  const notifQuery = useQuery(trpc.notification.get.queryOptions());
  const notifUpdate = useMutation(
    trpc.notification.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.notification.get.queryKey() });
        setSavedTick((n) => n + 1);
      },
    }),
  );

  const s = settingsQuery.data;
  const currency = (s?.currency as Currency) ?? "KRW";
  const defaultView = (s?.defaultView as DefaultView) ?? "subscription";
  const notifEnabled = notifQuery.data?.enabled ?? true;
  const notifTime = notifQuery.data?.defaultTime ?? "09:00";

  return (
    <Shell>
      {/* nav */}
      <div className="flex items-center justify-between px-5 pb-3 pt-2">
        <Link
          to="/"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
        >
          ‹
        </Link>
        <span className="text-[15px] font-medium tracking-tight">설정</span>
        <div className="w-8" />
      </div>

      {/* 계정 (로컬 전용 — 로그인 Phase 2) */}
      <div className="mx-5 mb-5 mt-1 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-xl">
          👤
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold tracking-tight">로그인하지 않음</div>
          <div className="mt-0.5 text-[11px] leading-snug text-white/35">
            로그인하면 백업·동기화가 활성화됩니다 (준비 중)
          </div>
        </div>
      </div>

      {/* 일반 */}
      <Group label="일반">
        <Row icon="🌐" label="언어">
          <span className="text-[13px] text-white/55">한국어</span>
        </Row>
        <Row icon="💰" label="기본 통화">
          <InlineSelect
            value={currency}
            onChange={(v) => updateMutation.mutate({ currency: v as Currency })}
            options={currencyOptions.map((c) => ({ value: c, label: currencyLabels[c] }))}
          />
        </Row>
        <Row icon="📱" label="첫 화면" last>
          <InlineSelect
            value={defaultView}
            onChange={(v) => updateMutation.mutate({ defaultView: v as DefaultView })}
            options={defaultViewOptions}
          />
        </Row>
      </Group>

      {/* 알림 */}
      <Group label="알림">
        <Row icon="🔔" label="결제 알림">
          <Toggle on={notifEnabled} onChange={(v) => notifUpdate.mutate({ enabled: v })} />
        </Row>
        <Row icon="⏰" label="알림 시간" last>
          <InlineSelect
            value={notifTime}
            onChange={(v) => notifUpdate.mutate({ defaultTime: v })}
            options={timeOptions}
          />
        </Row>
      </Group>

      {/* 법적 고지 */}
      <Group label="법적 고지">
        <LinkRow icon="🔒" label="개인정보처리방침" to="/privacy" />
        <LinkRow icon="📄" label="이용약관" to="/terms" last />
      </Group>

      <p className="px-5 pb-10 pt-2 text-center text-[11px] text-white/20">
        구독 관리 · v0.1.0
      </p>

      {/* 저장 완료 토스트 — 헤더 바로 아래(상단)에 고정해 어떤 뷰포트에서도 보이게 */}
      <div
        className={`pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center transition-all duration-200 ${
          savedTick > 0 ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        <div className="rounded-full border border-[rgba(74,58,255,0.4)] bg-[#1e1e2e]/95 px-4 py-2 text-[13px] font-medium text-white/85 shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur">
          저장됨 ✓
        </div>
      </div>
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

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mx-5 mb-4">
      <div className="mb-2.5 text-[11px] uppercase tracking-wider text-white/35">{label}</div>
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  last,
  children,
}: {
  icon: string;
  label: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        last ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-sm">
          {icon}
        </div>
        <span className="text-[13px] text-white/70">{label}</span>
      </div>
      {children}
    </div>
  );
}

function LinkRow({
  icon,
  label,
  to,
  last,
}: {
  icon: string;
  label: string;
  to: string;
  last?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3 active:bg-white/[0.03] ${
        last ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-sm">
          {icon}
        </div>
        <span className="text-[13px] text-white/70">{label}</span>
      </div>
      <span className="text-white/25">›</span>
    </Link>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      aria-pressed={on}
      className={`inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0 outline-none transition-colors ${
        on ? "bg-[#4a3aff]" : "bg-white/15"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function InlineSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-white/75 outline-none [color-scheme:dark] focus:border-[#4a3aff]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
