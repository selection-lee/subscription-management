import { router, publicProcedure } from "./trpc.ts";
import { prisma } from "@lib/schema/client";
import {
  appSettingsInput,
  createSubscriptionInput,
  listSubscriptionInput,
  subscriptionIdInput,
  updateSubscriptionInput,
} from "./schemas.ts";
import { TRPCError } from "@trpc/server";

const LOCAL_USER_EMAIL = "local@subscription-management.local";

async function getLocalUser() {
  return prisma.user.upsert({
    where: { email: LOCAL_USER_EMAIL },
    create: { email: LOCAL_USER_EMAIL },
    update: {},
  });
}

function parseIsoDate(value: string) {
  return new Date(value);
}

export const appRouter = router({
  subscription: router({
    list: publicProcedure.input(listSubscriptionInput).query(async ({ input }) => {
      const user = await getLocalUser();
      return prisma.subscription.findMany({
        where: { userId: user.id, status: input?.status },
        orderBy: { nextPaymentDate: "asc" },
      });
    }),

    getById: publicProcedure.input(subscriptionIdInput).query(async ({ input }) => {
      const user = await getLocalUser();
      const subscription = await prisma.subscription.findFirst({
        where: { id: input.id, userId: user.id },
      });
      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }
      return subscription;
    }),

    create: publicProcedure.input(createSubscriptionInput).mutation(async ({ input }) => {
      const user = await getLocalUser();
      return prisma.subscription.create({
        data: {
          userId: user.id,
          name: input.name,
          icon: input.icon,
          amount: input.amount,
          currency: input.currency,
          cycleUnit: input.cycleUnit,
          cycleInterval: input.cycleInterval,
          startDate: parseIsoDate(input.startDate),
          nextPaymentDate: parseIsoDate(input.nextPaymentDate),
          paymentMethod: input.paymentMethod ?? null,
          memo: input.memo ?? null,
          status: input.status,
        },
      });
    }),

    update: publicProcedure.input(updateSubscriptionInput).mutation(async ({ input }) => {
      const user = await getLocalUser();
      const existing = await prisma.subscription.findFirst({
        where: { id: input.id, userId: user.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.icon !== undefined) updateData.icon = input.icon;
      if (input.amount !== undefined) updateData.amount = input.amount;
      if (input.currency !== undefined) updateData.currency = input.currency;
      if (input.cycleUnit !== undefined) updateData.cycleUnit = input.cycleUnit;
      if (input.cycleInterval !== undefined) updateData.cycleInterval = input.cycleInterval;
      if (input.startDate !== undefined) updateData.startDate = parseIsoDate(input.startDate);
      if (input.nextPaymentDate !== undefined) updateData.nextPaymentDate = parseIsoDate(input.nextPaymentDate);
      if (input.paymentMethod !== undefined) updateData.paymentMethod = input.paymentMethod;
      if (input.memo !== undefined) updateData.memo = input.memo;
      if (input.status !== undefined) {
        updateData.status = input.status;
        // 스펙 §5.12: 아카이브 시 시각 기록, 복원 시 해제
        updateData.archivedAt = input.status === "ARCHIVED" ? new Date() : null;
      }

      return prisma.subscription.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

    delete: publicProcedure.input(subscriptionIdInput).mutation(async ({ input }) => {
      const user = await getLocalUser();
      const deleted = await prisma.subscription.deleteMany({
        where: { id: input.id, userId: user.id },
      });
      if (deleted.count === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }
      return { success: true };
    }),
  }),

  settings: router({
    get: publicProcedure.query(async () => {
      const user = await getLocalUser();
      return prisma.appSetting.findUnique({
        where: { userId: user.id },
      });
    }),

    update: publicProcedure.input(appSettingsInput).mutation(async ({ input }) => {
      const user = await getLocalUser();
      return prisma.appSetting.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          language: input.language ?? "ko",
          currency: input.currency ?? "KRW",
          defaultView: input.defaultView ?? "subscription",
        },
        update: {
          language: input.language,
          currency: input.currency,
          defaultView: input.defaultView,
        },
      });
    }),
  }),
});

export type AppRouter = typeof appRouter;
