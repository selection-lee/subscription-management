import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc.ts";
import {
  gradientFor,
  daysUntil,
  cycleEvery,
  formatAmount,
  formatDateLong,
} from "../lib/subscription.ts";

export const Route = createFileRoute("/subscription/$id")({
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const detailQuery = useQuery(trpc.subscription.getById.queryOptions({ id }));
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: trpc.subscription.list.queryKey() });
    queryClient.invalidateQueries({
      queryKey: trpc.subscription.getById.queryKey({ id }),
    });
  };

  const archiveMutation = useMutation(
    trpc.subscription.update.mutationOptions({
      onSuccess: () => {
        invalidate();
        void navigate({ to: "/" });
      },
    }),
  );
  const deleteMutation = useMutation(
    trpc.subscription.delete.mutationOptions({
      onSuccess: () => {
        invalidate();
        void navigate({ to: "/" });
      },
    }),
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

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

  const s = detailQuery.data;
  const days = daysUntil(s.nextPaymentDate);
  // 30일 정규화 링 (스펙 §4 Phone 1 hero ring)
  const circumference = 2 * Math.PI * 26;
  const ratio = Math.max(0, Math.min(1, days / 30));
  const dashoffset = circumference * (1 - ratio);

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
        <span className="text-[15px] font-medium tracking-tight">구독 상세</span>
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
          >
            ⋮
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 w-[150px] rounded-2xl border border-white/10 bg-[#1e1e2e] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                onClick={() => navigate({ to: "/subscription/$id/edit", params: { id } })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-white/75 hover:bg-white/[0.06]"
              >
                ✏️ 편집
              </button>
              <button
                type="button"
                onClick={() => archiveMutation.mutate({ id, status: "ARCHIVED" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-white/75 hover:bg-white/[0.06]"
              >
                🗃 아카이브
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm("정말 삭제하시겠습니까? 되돌릴 수 없습니다.")) {
                    deleteMutation.mutate({ id });
                  }
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-[13px] text-[#f87171] hover:bg-white/[0.06]"
              >
                🗑 삭제
              </button>
            </div>
          )}
        </div>
      </div>

      {/* service header */}
      <div className="px-5 pb-5 pt-2 text-center">
        <div
          className="mx-auto mb-3 flex h-[68px] w-[68px] items-center justify-center rounded-[18px] text-3xl shadow-[0_4px_20px_rgba(74,58,255,0.4)]"
          style={{ background: gradientFor(s.id) }}
        >
          {s.icon ?? "✨"}
        </div>
        <div className="mb-1.5 text-xl font-semibold tracking-tight">{s.name}</div>
        <div className="flex justify-center gap-1.5">
          {s.status === "ACTIVE" ? (
            <span className="rounded-full border border-[rgba(78,207,168,0.3)] bg-[rgba(29,158,117,0.18)] px-2.5 py-[3px] text-[11px] font-medium text-[#4ecfa8]">
              ● 활성
            </span>
          ) : (
            <span className="rounded-full border border-white/15 bg-white/[0.07] px-2.5 py-[3px] text-[11px] font-medium text-white/45">
              아카이브됨
            </span>
          )}
        </div>
      </div>

      {/* hero */}
      <div className="mx-5 mb-4 rounded-[20px] border border-white/10 bg-white/[0.04] p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 text-[11px] uppercase tracking-wider text-white/45">
              결제 금액
            </div>
            <div className="text-[32px] font-bold leading-none tracking-tight">
              {formatAmount(s.amount, s.currency)}
            </div>
            <div className="mt-1 text-[13px] text-white/40">
              {cycleEvery(s.cycleUnit, s.cycleInterval)} · {s.currency}
            </div>
          </div>
          <div className="relative h-[68px] w-[68px]">
            <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
              <circle cx="34" cy="34" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
              <circle
                cx="34"
                cy="34"
                r="26"
                fill="none"
                stroke="#4ecfa8"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashoffset}
              />
            </svg>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-[15px] font-bold leading-none">{days < 0 ? 0 : days}</div>
              <div className="mt-0.5 text-[9px] text-white/40">일 남음</div>
            </div>
          </div>
        </div>
        <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.08] pt-3.5">
          <span className="text-[11px] text-white/40">다음 결제일</span>
          <span className="text-[12px] font-medium text-white/70">
            {formatDateLong(s.nextPaymentDate)}
          </span>
        </div>
      </div>

      {/* detail info */}
      <div className="mx-5 mb-4">
        <div className="mb-2.5 text-[11px] uppercase tracking-wider text-white/35">상세 정보</div>
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <DetailRow label="결제 금액" value={`${formatAmount(s.amount, s.currency)} · ${s.currency}`} />
          <DetailRow label="결제 주기" value={cycleEvery(s.cycleUnit, s.cycleInterval)} />
          <DetailRow label="시작일" value={formatDateLong(s.startDate)} />
          <DetailRow label="다음 결제일" value={formatDateLong(s.nextPaymentDate)} />
          <DetailRow label="결제 수단" value={s.paymentMethod ?? "—"} last />
        </div>
      </div>

      {/* memo */}
      {s.memo && (
        <div className="mx-5 mb-4">
          <div className="mb-2.5 text-[11px] uppercase tracking-wider text-white/35">메모</div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5 text-[13px] leading-relaxed text-white/45">
            {s.memo}
          </div>
        </div>
      )}

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

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 ${
        last ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <span className="text-[13px] text-white/45">{label}</span>
      <span className="text-[13px] font-medium text-white/85">{value}</span>
    </div>
  );
}
