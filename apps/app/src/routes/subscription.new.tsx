import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "../trpc.ts";
import { toDateInputValue } from "../lib/subscription.ts";
import { SubscriptionForm } from "../components/SubscriptionForm.tsx";

export const Route = createFileRoute("/subscription/new")({
  component: NewPage,
});

function NewPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createMutation = useMutation(
    trpc.subscription.create.mutationOptions({
      onSuccess: (created) => {
        queryClient.invalidateQueries({ queryKey: trpc.subscription.list.queryKey() });
        void navigate({ to: "/subscription/$id", params: { id: created.id } });
      },
    }),
  );

  const today = toDateInputValue(new Date());

  return (
    <SubscriptionForm
      title="새 구독"
      submitLabel="추가하기"
      gradientSeed="new"
      initial={{
        name: "",
        icon: "✨",
        amount: 0,
        currency: "KRW",
        cycleUnit: "MONTH",
        cycleInterval: 1,
        startDate: today,
        nextPaymentDate: today,
        paymentMethod: "",
        memo: "",
      }}
      onSubmit={(v) =>
        createMutation.mutate({
          name: v.name,
          icon: v.icon,
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
      onCancel={() => navigate({ to: "/" })}
      isPending={createMutation.isPending}
      isError={createMutation.isError}
    />
  );
}
