import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc.ts";
import {
  toDateInputValue,
  presetIndexForId,
  type Currency,
  type CycleUnit,
} from "../lib/subscription.ts";
import { SubscriptionForm } from "../components/SubscriptionForm.tsx";

export const Route = createFileRoute("/subscription/$id_/edit")({
  component: EditPage,
});

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

  if (detailQuery.isPending) {
    return <Centered>불러오는 중...</Centered>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <Centered>
        <p className="text-sm text-white/50">구독을 찾을 수 없습니다.</p>
        <Link to="/" className="mt-3 inline-block text-sm text-[#8b7fff]">
          ← 목록으로
        </Link>
      </Centered>
    );
  }

  const d = detailQuery.data;
  return (
    <SubscriptionForm
      title="편집"
      submitLabel="수정완료"
      initial={{
        name: d.name,
        icon: d.icon ?? "✨",
        colorPreset: d.colorPreset ?? presetIndexForId(d.id),
        iconColor: d.iconColor ?? null,
        amount: Number(d.amount ?? 0),
        currency: d.currency as Currency,
        cycleUnit: d.cycleUnit as CycleUnit,
        cycleInterval: d.cycleInterval,
        startDate: toDateInputValue(d.startDate),
        nextPaymentDate: toDateInputValue(d.nextPaymentDate),
        paymentMethod: d.paymentMethod ?? "",
        memo: d.memo ?? "",
      }}
      onSubmit={(v) =>
        updateMutation.mutate({
          id,
          name: v.name,
          icon: v.icon,
          colorPreset: v.colorPreset,
          iconColor: v.iconColor,
          amount: v.amount,
          currency: v.currency,
          cycleUnit: v.cycleUnit,
          cycleInterval: v.cycleInterval,
          startDate: v.startDate,
          nextPaymentDate: v.nextPaymentDate,
          paymentMethod: v.paymentMethod || undefined,
          memo: v.memo || undefined,
        })
      }
      onCancel={() => navigate({ to: "/subscription/$id", params: { id } })}
      isPending={updateMutation.isPending}
      isError={updateMutation.isError}
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white">
      <div className="mx-auto max-w-md px-5 py-10 text-center">{children}</div>
    </div>
  );
}
