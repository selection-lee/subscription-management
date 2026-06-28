import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import {
  type Currency,
  type CycleUnit,
  currencyOptions,
  cycleUnits,
  gradients,
  gradientFromHex,
} from "../lib/subscription.ts";
import { EmojiPicker } from "./EmojiPicker.tsx";

export type SubscriptionFormValues = {
  name: string;
  icon: string;
  colorPreset: number;
  iconColor: string | null;
  amount: number;
  currency: Currency;
  cycleUnit: CycleUnit;
  cycleInterval: number;
  startDate: string;
  nextPaymentDate: string;
  paymentMethod: string;
  memo: string;
};

// 생성(/subscription/new)과 편집(/subscription/$id/edit)이 공유하는 풀페이지 폼.
export function SubscriptionForm({
  title,
  submitLabel,
  initial,
  onSubmit,
  onCancel,
  isPending,
  isError,
}: {
  title: string;
  submitLabel: string;
  initial: SubscriptionFormValues;
  onSubmit: (values: SubscriptionFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
  isError: boolean;
}) {
  const [form, setForm] = useState<SubscriptionFormValues>(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const currentBg = form.iconColor
    ? gradientFromHex(form.iconColor)
    : gradients[form.colorPreset];

  // hex 직접 입력 — 스와치/컬러피커와 양방향 동기화
  const [hexInput, setHexInput] = useState(form.iconColor ?? "");
  useEffect(() => {
    setHexInput(form.iconColor ?? "");
  }, [form.iconColor]);
  const hexValid = /^#[0-9a-f]{6}$/i.test(hexInput);

  const onHexChange = (raw: string) => {
    let v = raw.trim();
    if (v && !v.startsWith("#")) v = "#" + v;
    setHexInput(v);
    if (/^#[0-9a-f]{6}$/i.test(v)) setForm({ ...form, iconColor: v.toLowerCase() });
  };

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto max-w-md pt-3">
        {/* nav */}
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-white/60"
          >
            취소
          </button>
          <span className="text-[15px] font-medium tracking-tight">{title}</span>
          <button
            type="button"
            onClick={() => onSubmit(form)}
            disabled={isPending}
            className="rounded-[10px] border border-[rgba(74,58,255,0.5)] bg-[rgba(74,58,255,0.25)] px-2.5 py-1.5 text-[11px] font-semibold text-[#8b7fff] disabled:opacity-50"
          >
            {isPending ? "저장 중..." : submitLabel}
          </button>
        </div>

        {/* save error */}
        {isError && (
          <div className="mx-5 mb-4 flex items-center gap-2 rounded-xl border border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.1)] px-3.5 py-2.5">
            <span className="text-sm">⚠️</span>
            <span className="text-[12px] text-[#fca5a5]">
              저장에 실패했습니다. 이름·아이콘·금액 등 입력값을 확인해주세요.
            </span>
          </div>
        )}

        {/* icon + name */}
        <div className="px-5 pb-4 text-center">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            aria-label="아이콘·색상 변경"
            className="relative mx-auto mb-3 flex h-[68px] w-[68px] items-center justify-center rounded-[18px] text-3xl shadow-[0_4px_20px_rgba(74,58,255,0.4)] active:scale-95"
            style={{ background: currentBg }}
          >
            {form.icon || "✨"}
            <span className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-[#1e1e2e] text-white/80 shadow-md">
              <Pencil size={13} />
            </span>
          </button>
          <div className="px-10">
            <input
              className="w-full border-b border-white/10 bg-transparent pb-1 text-center text-lg font-semibold outline-none focus:border-[#4a3aff]"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="서비스 이름"
            />
          </div>
        </div>

        {/* 색상 + 이모지 통합 패널 (연필 클릭 시) */}
        {pickerOpen && (
          <div className="mx-5 mb-4 rounded-2xl border border-white/[0.08] bg-[#15151d] p-3">
            <div className="mb-2 text-[11px] uppercase tracking-wider text-white/35">색상</div>
            <div className="mb-3 flex flex-wrap justify-center gap-2.5">
              {gradients.map((g, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setForm({ ...form, colorPreset: i, iconColor: null })}
                  aria-label={`색상 ${i + 1}`}
                  className={`h-7 w-7 rounded-full transition-transform active:scale-90 ${
                    !form.iconColor && form.colorPreset === i
                      ? "ring-2 ring-white ring-offset-2 ring-offset-[#15151d]"
                      : "opacity-80"
                  }`}
                  style={{ background: g }}
                />
              ))}
              {/* 커스텀 색 — 무지개 칸을 직접 탭하면 OS 컬러 피커 (모바일 포함) */}
              <div
                className={`relative h-7 w-7 overflow-hidden rounded-full transition-transform active:scale-90 ${
                  form.iconColor
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[#15151d]"
                    : "opacity-90"
                }`}
                style={{
                  background: form.iconColor
                    ? form.iconColor
                    : "conic-gradient(from 0deg, #ff5f6d, #ffc371, #47e891, #2bd2ff, #4a3aff, #c850c0, #ff5f6d)",
                }}
              >
                <input
                  type="color"
                  aria-label="커스텀 색상"
                  value={form.iconColor ?? "#4a3aff"}
                  onChange={(e) => setForm({ ...form, iconColor: e.target.value })}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
            </div>

            {/* hex 직접 입력 — 커스텀(무지개) 색일 때만 노출 */}
            {form.iconColor && (
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-[11px] font-medium text-white/35">HEX</span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => onHexChange(e.target.value)}
                  placeholder="#4a3aff"
                  maxLength={7}
                  spellCheck={false}
                  className={`w-28 rounded-lg border bg-white/[0.04] px-3 py-1.5 text-center text-sm outline-none focus:border-[#4a3aff] ${
                    hexInput && !hexValid ? "border-[rgba(248,113,113,0.5)]" : "border-white/10"
                  }`}
                />
              </div>
            )}
            <div className="mb-2.5 h-px bg-white/[0.06]" />
            <div className="mb-2 text-[11px] uppercase tracking-wider text-white/35">이모지</div>
            <EmojiPicker
              value={form.icon}
              onSelect={(emoji) => setForm({ ...form, icon: emoji })}
            />
          </div>
        )}

        {/* payment info */}
        <Section title="결제 정보">
          <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
            <Row label="결제 금액">
              <input
                type="number"
                className="w-32 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-right text-sm outline-none focus:border-[#4a3aff]"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                min={0}
              />
            </Row>
            <Row label="결제 통화">
              <SelectBox
                value={form.currency}
                onChange={(v) => setForm({ ...form, currency: v as Currency })}
                options={currencyOptions.map((c) => ({ value: c, label: c }))}
              />
            </Row>
            <Row label="결제 주기">
              <SelectBox
                value={form.cycleUnit}
                onChange={(v) => setForm({ ...form, cycleUnit: v as CycleUnit })}
                options={cycleUnits.map((u) => ({
                  value: u,
                  label: u === "WEEK" ? "매주" : u === "MONTH" ? "매월" : "매년",
                }))}
              />
            </Row>
            <Row label="시작일">
              <input
                type="date"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Row>
            <Row label="다음 결제일">
              <input
                type="date"
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm outline-none [color-scheme:dark] focus:border-[#4a3aff]"
                value={form.nextPaymentDate}
                onChange={(e) => setForm({ ...form, nextPaymentDate: e.target.value })}
              />
            </Row>
            <Row label="결제 수단" last>
              <input
                className="w-36 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-right text-sm outline-none focus:border-[#4a3aff]"
                value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                placeholder="신한카드 등"
              />
            </Row>
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
      </div>
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

function Row({
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
