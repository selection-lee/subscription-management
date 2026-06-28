import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc.ts";
import {
  type Currency,
  type CycleUnit,
  currencyOptions,
  cycleUnits,
  gradientFor,
  toDateInputValue,
} from "../lib/subscription.ts";

export const Route = createFileRoute("/subscription/$id/edit")({
  component: EditPage,
});

type FormValues = {
  name: string;
  icon: string;
  amount: number;
  currency: Currency;
  cycleUnit: CycleUnit;
  cycleInterval: number;
  startDate: string;
  nextPaymentDate: string;
  paymentMethod: string;
  memo: string;
};

function EditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const detailQuery = useQuery(trpc.subscription.getById.queryOptions({ id }));
  const updateMutation = useMutation(
    trpc.subscription.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.subscription.list.queryKey() });
        queryClient.invalidateQueries({
          queryKey: trpc.subscription.getById.queryKey({ id }),
        });
        void navigate({ to: "/subscription/$id", params: { id } });
      },
    }),
  );

  const handleSave = (form: FormValues) =>
    updateMutation.mutate({
      id,
      name: form.name,
      icon: form.icon,
      amount: form.amount,
      currency: form.currency,
      cycleUnit: form.cycleUnit,
      cycleInterval: form.cycleInterval,
      startDate: form.startDate,
      nextPaymentDate: form.nextPaymentDate,
      paymentMethod: form.paymentMethod || undefined,
      memo: form.memo || undefined,
    });

  if (detailQuery.isPending) {
    return (
      <Shell>
        <p className="px-5 py-10 text-center text-sm text-white/30">불러오는 중...</p>
      </Shell>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <Shell>
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-white/50">구독을 찾을 수 없습니다.</p>
          <Link to="/" className="mt-3 inline-block text-sm text-[#8b7fff]">
            ← 목록으로
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <EditForm
      id={id}
      initial={detailQuery.data}
      onSave={handleSave}
      isPending={updateMutation.isPending}
    />
  );
}

function EditForm({
  id,
  initial,
  onSave,
  isPending,
}: {
  id: string;
  initial: {
    name: string;
    icon: string | null;
    amount: unknown;
    currency: string;
    cycleUnit: string;
    cycleInterval: number;
    startDate: Date | string;
    nextPaymentDate: Date | string;
    paymentMethod: string | null;
    memo: string | null;
  };
  onSave: (form: FormValues) => void;
  isPending: boolean;
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormValues>({
    name: initial.name,
    icon: initial.icon ?? "✨",
    amount: Number(initial.amount ?? 0),
    currency: initial.currency as Currency,
    cycleUnit: initial.cycleUnit as CycleUnit,
    cycleInterval: initial.cycleInterval,
    startDate: toDateInputValue(initial.startDate),
    nextPaymentDate: toDateInputValue(initial.nextPaymentDate),
    paymentMethod: initial.paymentMethod ?? "",
    memo: initial.memo ?? "",
  });

  return (
    <Shell>
      {/* nav */}
      <div className="flex items-center justify-between px-5 pb-3 pt-2">
        <button
          type="button"
          onClick={() => navigate({ to: "/subscription/$id", params: { id } })}
          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-white/60"
        >
          취소
        </button>
        <span className="text-[15px] font-medium tracking-tight">편집</span>
        <button
          type="button"
          onClick={() => onSave(form)}
          disabled={isPending}
          className="rounded-[10px] border border-[rgba(74,58,255,0.5)] bg-[rgba(74,58,255,0.25)] px-2.5 py-1.5 text-[11px] font-semibold text-[#8b7fff] disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "수정완료"}
        </button>
      </div>

      {/* edit banner */}
      <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-[rgba(74,58,255,0.2)] bg-[rgba(74,58,255,0.07)] px-3.5 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-[#8b7fff]" />
        <span className="text-[11px] text-white/50">
          편집 중 · 저장하지 않으면 변경사항이 사라집니다
        </span>
      </div>

      {/* icon + name */}
      <div className="px-5 pb-4 text-center">
        <div
          className="mx-auto mb-2.5 flex h-[68px] w-[68px] items-center justify-center rounded-[18px] text-3xl shadow-[0_4px_20px_rgba(74,58,255,0.4)]"
          style={{ background: gradientFor(id) }}
        >
          {form.icon || "✨"}
        </div>
        <div className="px-10">
          <input
            className="w-full border-b border-white/10 bg-transparent pb-1 text-center text-lg font-semibold outline-none focus:border-[#4a3aff]"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="서비스 이름"
          />
        </div>
        <div className="mt-3 inline-flex items-center gap-2">
          <span className="text-[11px] text-white/40">아이콘</span>
          <input
            className="w-16 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-center text-sm outline-none focus:border-[#4a3aff]"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            maxLength={4}
          />
        </div>
      </div>

      {/* payment info */}
      <Section title="결제 정보">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <EditRow label="결제 금액">
            <input
              type="number"
              className="w-32 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-right text-sm outline-none focus:border-[#4a3aff]"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              min={0}
            />
          </EditRow>
          <EditRow label="결제 통화">
            <SelectBox
              value={form.currency}
              onChange={(v) => setForm({ ...form, currency: v as Currency })}
              options={currencyOptions.map((c) => ({ value: c, label: c }))}
            />
          </EditRow>
          <EditRow label="결제 주기">
            <SelectBox
              value={form.cycleUnit}
              onChange={(v) => setForm({ ...form, cycleUnit: v as CycleUnit })}
              options={cycleUnits.map((u) => ({
                value: u,
                label: u === "WEEK" ? "매주" : u === "MONTH" ? "매월" : "매년",
              }))}
            />
          </EditRow>
          <EditRow label="주기 간격">
            <input
              type="number"
              className="w-20 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-right text-sm outline-none focus:border-[#4a3aff]"
              value={form.cycleInterval}
              onChange={(e) => setForm({ ...form, cycleInterval: Number(e.target.value) })}
              min={1}
            />
          </EditRow>
          <EditRow label="시작일">
            <input
              type="date"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </EditRow>
          <EditRow label="다음 결제일">
            <input
              type="date"
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
              value={form.nextPaymentDate}
              onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
            />
          </EditRow>
          <EditRow label="결제 수단" last>
            <input
              className="w-36 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-right text-sm outline-none focus:border-[#4a3aff]"
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              placeholder="신한카드 등"
            />
          </EditRow>
        </div>
      </Section>

      {/* memo */}
      <Section title="메모">
        <textarea
          className="min-h-[88px] w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-[13px] leading-relaxed outline-none focus:border-[#4a3aff]"
          value={form.memo}
          onChange={(e) => setForm({ ...form, memo: e.target.value })}
          placeholder="메모를 입력하세요"
          maxLength={500}
        />
      </Section>

      <div className="h-10" />
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-5 mb-4">
      <div className="mb-2.5 text-[11px] uppercase tracking-wider text-white/35">{title}</div>
      {children}
    </div>
  );
}

function EditRow({
  label,
  last,
  children,
}: {
  label: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-2.5 ${
        last ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <span className="text-[13px] text-white/45">{label}</span>
      {children}
    </div>
  );
}

function SelectBox({
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
      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
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
