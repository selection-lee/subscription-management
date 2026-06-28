export type Currency = "KRW" | "USD" | "EUR" | "JPY";
export type CycleUnit = "WEEK" | "MONTH" | "YEAR";
export type SortKey = "date" | "name" | "amount";

export const currencyOptions: Currency[] = ["KRW", "USD", "EUR", "JPY"];
export const cycleUnits: CycleUnit[] = ["WEEK", "MONTH", "YEAR"];

export const sortLabels: Record<SortKey, string> = {
  date: "결제 예정일순",
  name: "이름순",
  amount: "금액순",
};

// 스펙 §5.9 — 아이콘 그라디언트 6종 (colorPreset 미저장이므로 id 해시로 선택)
const gradients = [
  "linear-gradient(135deg,#1a1a6e,#4a3aff)",
  "linear-gradient(135deg,#0d4f3c,#1d9e75)",
  "linear-gradient(135deg,#6b0f1a,#d85a30)",
  "linear-gradient(135deg,#1a003d,#7c3aed)",
  "linear-gradient(135deg,#0a2540,#185fa5)",
  "linear-gradient(135deg,#2c2c2c,#5f5e5a)",
];

export function gradientFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return gradients[h % gradients.length];
}

export function toDateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function daysUntil(target: Date | string) {
  const today = startOfDay(new Date());
  const t = startOfDay(new Date(target));
  return Math.round((t.getTime() - today.getTime()) / 86_400_000);
}

// 스펙 §5.2
export function dDayLabel(d: number): { text: string; cls: "urgent" | "soon" | "normal" } {
  if (d < 0) return { text: `D+${-d}`, cls: "normal" };
  if (d === 0) return { text: "오늘", cls: "urgent" };
  if (d === 1) return { text: "내일", cls: "urgent" };
  if (d <= 7) return { text: `D-${d}`, cls: "soon" };
  return { text: `D-${d}`, cls: "normal" };
}

export const ddayClass: Record<"urgent" | "soon" | "normal", string> = {
  soon: "bg-[rgba(139,127,255,0.18)] text-[#9b8fff]",
  urgent: "bg-[rgba(74,58,255,0.25)] text-[#8b7fff]",
  normal: "bg-white/[0.07] text-white/45",
};

export function cycleLabel(unit: string, interval: number) {
  const base = unit === "WEEK" ? "주" : unit === "YEAR" ? "년" : "월";
  return interval > 1 ? `${interval}${base}` : base;
}

export function cycleEvery(unit: string, interval: number) {
  const base = unit === "WEEK" ? "주" : unit === "YEAR" ? "년" : "월";
  return interval > 1 ? `${interval}${base}마다` : `매${base}`;
}

export function formatAmount(amount: unknown, currency: string) {
  const n = Number(amount ?? 0);
  if (currency === "KRW") return `₩${n.toLocaleString()}`;
  if (currency === "JPY") return `¥${n.toLocaleString()}`;
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : `${currency} `;
  return `${symbol}${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDateKo(value: Date | string) {
  const d = new Date(value);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function formatDateLong(value: Date | string) {
  const d = new Date(value);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${weekdays[d.getDay()]})`;
}

export function isInCurrentMonth(date: Date | string) {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}
