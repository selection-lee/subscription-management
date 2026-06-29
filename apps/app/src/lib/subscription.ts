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

// 스펙 §5.9 — 아이콘 그라디언트 6종 (colorPreset). 미저장(null)이면 id 해시로 선택.
export const gradients = [
  "linear-gradient(135deg,#1a1a6e,#4a3aff)",
  "linear-gradient(135deg,#0d4f3c,#1d9e75)",
  "linear-gradient(135deg,#6b0f1a,#d85a30)",
  "linear-gradient(135deg,#1a003d,#7c3aed)",
  "linear-gradient(135deg,#0a2540,#185fa5)",
  "linear-gradient(135deg,#2c2c2c,#5f5e5a)",
];

export function presetIndexForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % gradients.length;
}

export function gradientFor(id: string) {
  return gradients[presetIndexForId(id)];
}

function darkenHex(hex: string, factor: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * factor);
  const g = Math.round(((n >> 8) & 255) * factor);
  const b = Math.round((n & 255) * factor);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 커스텀 색(hex) → 프리셋과 톤 맞춘 그라디언트
export function gradientFromHex(hex: string) {
  return `linear-gradient(135deg, ${hex}, ${darkenHex(hex, 0.62)})`;
}

// 우선순위: 커스텀 색(iconColor) > 프리셋(colorPreset) > id 해시
export function gradientForSubscription(s: {
  id: string;
  colorPreset?: number | null;
  iconColor?: string | null;
}) {
  if (s.iconColor) return gradientFromHex(s.iconColor);
  return s.colorPreset != null ? gradients[s.colorPreset] : gradients[presetIndexForId(s.id)];
}

export function toDateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

// 다음 결제일 = 시작일 + (간격 × 단위). UTC 기준으로 계산해 타임존 드리프트 방지.
// 월말 케이스(1/31 + 1개월)는 JS 기본 오버플로 동작(→ 3/3) — 요구사항 §8-3, 추후 보정.
export function addCycle(dateStr: string, unit: string, interval: number) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return dateStr;
  const n = interval || 1;
  if (unit === "WEEK") d.setUTCDate(d.getUTCDate() + 7 * n);
  else if (unit === "YEAR") d.setUTCFullYear(d.getUTCFullYear() + n);
  else d.setUTCMonth(d.getUTCMonth() + n);
  return d.toISOString().slice(0, 10);
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

// decisions.md §0001 — 통화별 "연환산" 집계 엔진 (rate-agnostic 순수 함수).
// 환율을 모르며, 통화별 버킷만 반환한다. 환산(C)은 이 결과를 입력으로 받는 별도 스텝.
type CyclelikeSub = {
  amount: unknown;
  currency: string;
  cycleUnit: string;
  cycleInterval: number;
};

export function annualizedByCurrency(subs: CyclelikeSub[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of subs) {
    // 주×52 / 월×12 / 년×1, 모두 ÷ cycleInterval (예: 2개월마다 → 12/2 = 6회/년)
    const perYearBase = s.cycleUnit === "WEEK" ? 52 : s.cycleUnit === "YEAR" ? 1 : 12;
    const paymentsPerYear = perYearBase / (s.cycleInterval || 1);
    out[s.currency] = (out[s.currency] ?? 0) + Number(s.amount ?? 0) * paymentsPerYear;
  }
  return out;
}

// MVP 인앱 알림(§7.1·§8-16 "놓친 알림 재조립"): 결제일이 지났거나(놓침)
// daysBefore일 이내로 임박한 활성 구독. 가장 급한(많이 지난) 순으로 정렬.
export function paymentAlerts<T extends { nextPaymentDate: Date | string }>(
  subs: T[],
  daysBefore = 1,
): { subscription: T; days: number }[] {
  return subs
    .map((s) => ({ subscription: s, days: daysUntil(s.nextPaymentDate) }))
    .filter((a) => a.days <= daysBefore)
    .sort((a, b) => a.days - b.days);
}

// 알림 D-day 라벨 (지남/오늘/내일/D-n)
export function alertLabel(days: number): { text: string; cls: "overdue" | "today" | "soon" } {
  if (days < 0) return { text: `${-days}일 지남`, cls: "overdue" };
  if (days === 0) return { text: "오늘", cls: "today" };
  if (days === 1) return { text: "내일", cls: "soon" };
  return { text: `D-${days}`, cls: "soon" };
}

export const alertClass: Record<"overdue" | "today" | "soon", string> = {
  overdue: "bg-[rgba(248,113,113,0.15)] text-[#f87171]",
  today: "bg-[rgba(74,58,255,0.25)] text-[#8b7fff]",
  soon: "bg-[rgba(139,127,255,0.18)] text-[#9b8fff]",
};
