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

function SettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery(trpc.settings.get.queryOptions());
  const updateMutation = useMutation(
    trpc.settings.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.settings.get.queryKey() });
      },
    }),
  );

  const s = settingsQuery.data;
  const currency = (s?.currency as Currency) ?? "KRW";
  const defaultView = (s?.defaultView as DefaultView) ?? "subscription";

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
        <span className="text-[11px] text-white/30">
          {updateMutation.isPending ? "저장 중..." : ""}
        </span>
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

      {/* 법적 고지 */}
      <Group label="법적 고지">
        <LinkRow icon="🔒" label="개인정보처리방침" to="/privacy" />
        <LinkRow icon="📄" label="이용약관" to="/terms" last />
      </Group>

      <p className="px-5 pb-10 pt-2 text-center text-[11px] text-white/20">
        구독 관리 · v0.1.0
      </p>
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
