import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Subscription } from "@lib/schema";
import { useTRPC } from "../trpc.ts";
import {
  gradientForSubscription,
  cycleLabel,
  formatAmount,
  formatDateKo,
} from "../lib/subscription.ts";

export const Route = createFileRoute("/archive")({
  component: ArchivePage,
});

function ArchivePage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const listQuery = useQuery(trpc.subscription.list.queryOptions({ status: "ARCHIVED" }));
  const restoreMutation = useMutation(
    trpc.subscription.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.subscription.list.queryKey() });
      },
    }),
  );

  const items = listQuery.data ?? [];

  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto max-w-md pt-3">
        {/* nav */}
        <div className="flex items-center justify-between px-5 pb-3 pt-2">
          <Link
            to="/"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-sm"
          >
            ‹
          </Link>
          <span className="text-[15px] font-medium tracking-tight">아카이브</span>
          <div className="w-8" />
        </div>

        <div className="px-4">
          <p className="px-1 pb-3 text-[11px] text-white/25">
            더 이상 사용하지 않는 구독 항목입니다.
          </p>

          {listQuery.isPending ? (
            <p className="py-8 text-center text-sm text-white/30">불러오는 중...</p>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
              <p className="text-3xl">🗃</p>
              <p className="mt-2 text-sm text-white/50">아카이브된 구독이 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
              {items.map((s, i) => (
                <ArchiveRow
                  key={s.id}
                  subscription={s}
                  last={i === items.length - 1}
                  onRestore={() => restoreMutation.mutate({ id: s.id, status: "ACTIVE" })}
                  pending={restoreMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArchiveRow({
  subscription: s,
  last,
  onRestore,
  pending,
}: {
  subscription: Subscription;
  last: boolean;
  onRestore: () => void;
  pending: boolean;
}) {
  const meta = `${formatAmount(s.amount, s.currency)}/${cycleLabel(s.cycleUnit, s.cycleInterval)}${
    s.archivedAt ? ` · ${formatDateKo(s.archivedAt)} 해지` : ""
  }`;

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-3.5 ${
        last ? "" : "border-b border-white/[0.06]"
      }`}
    >
      <div
        className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[11px] text-lg opacity-70"
        style={{ background: gradientForSubscription(s) }}
      >
        {s.icon ?? "✨"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white/55">{s.name}</div>
        <div className="mt-0.5 text-[11px] text-white/25">{meta}</div>
      </div>
      <button
        type="button"
        onClick={onRestore}
        disabled={pending}
        className="flex-shrink-0 rounded-lg border border-white/10 bg-white/[0.06] px-2.5 py-1.5 text-[11px] text-white/40 disabled:opacity-50"
      >
        복원
      </button>
    </div>
  );
}
