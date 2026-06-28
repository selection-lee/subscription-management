import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Subscription } from "@lib/schema";
import { useTRPC } from "../trpc.ts";
import {
  type Currency,
  type CycleUnit,
  type SortKey,
  currencyOptions,
  cycleUnits,
  sortLabels,
  gradientFor,
  toDateInputValue,
  daysUntil,
  dDayLabel,
  ddayClass,
  cycleLabel,
  formatAmount,
  formatDateKo,
  isInCurrentMonth,
} from "../lib/subscription.ts";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const invalidateList = () =>
    queryClient.invalidateQueries({
      queryKey: trpc.subscription.list.queryKey(),
    });

  const listQuery = useQuery(trpc.subscription.list.queryOptions({ status: "ACTIVE" }));
  const createMutation = useMutation(
    trpc.subscription.create.mutationOptions({ onSuccess: invalidateList }),
  );

  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sheetOpen, setSheetOpen] = useState(false);

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
          <SummaryCell value="0건" label="미확인 알림" />
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
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-6 right-[max(1.5rem,calc(50%-13rem))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#4a3aff] text-3xl font-light leading-none text-white shadow-[0_4px_20px_rgba(74,58,255,0.5)] active:scale-95"
        aria-label="새 구독 추가"
      >
        +
      </button>

      {sheetOpen && (
        <CreateSheet
          onClose={() => setSheetOpen(false)}
          onSubmit={async (input) => {
            await createMutation.mutateAsync(input);
            setSheetOpen(false);
          }}
          isPending={createMutation.isPending}
        />
      )}
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
          style={{ background: gradientFor(subscription.id) }}
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

type CreateInput = {
  name: string;
  icon: string;
  amount: number;
  currency: Currency;
  cycleUnit: CycleUnit;
  cycleInterval: number;
  startDate: string;
  nextPaymentDate: string;
};

function CreateSheet({
  onClose,
  onSubmit,
  isPending,
}: {
  onClose: () => void;
  onSubmit: (input: CreateInput) => Promise<void>;
  isPending: boolean;
}) {
  const today = toDateInputValue(new Date());
  const [form, setForm] = useState<CreateInput>({
    name: "",
    icon: "✨",
    amount: 0,
    currency: "KRW",
    cycleUnit: "MONTH",
    cycleInterval: 1,
    startDate: today,
    nextPaymentDate: today,
  });

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50 sm:items-center">
      <div className="w-full max-w-md rounded-t-3xl border-t border-white/10 bg-[#1a1a22] p-6 text-white shadow-2xl sm:rounded-3xl sm:border">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">새 구독 추가</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-white/50 hover:bg-white/10"
          >
            ✕
          </button>
        </div>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(form);
          }}
        >
          <SheetField label="서비스 이름" className="sm:col-span-2">
            <input
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#4a3aff]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </SheetField>
          <SheetField label="아이콘">
            <input
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#4a3aff]"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              maxLength={4}
            />
          </SheetField>
          <SheetField label="통화">
            <select
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
            >
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </SheetField>
          <SheetField label="금액">
            <input
              type="number"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#4a3aff]"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              min={0}
              required
            />
          </SheetField>
          <SheetField label="주기">
            <select
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
              value={form.cycleUnit}
              onChange={(e) => setForm({ ...form, cycleUnit: e.target.value as CycleUnit })}
            >
              {cycleUnits.map((u) => (
                <option key={u} value={u}>
                  {u === "WEEK" ? "매주" : u === "MONTH" ? "매월" : "매년"}
                </option>
              ))}
            </select>
          </SheetField>
          <SheetField label="시작일">
            <input
              type="date"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              required
            />
          </SheetField>
          <SheetField label="다음 결제일" className="sm:col-span-2">
            <input
              type="date"
              className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
              value={form.nextPaymentDate}
              onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
              required
            />
          </SheetField>
          <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/70"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-[#4a3aff] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? "추가 중..." : "추가하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SheetField({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-1 ${className ?? ""}`}>
      <span className="text-sm font-medium text-white/70">{label}</span>
      {children}
    </label>
  );
}
