import { z } from "zod";

export const subscriptionStatusEnum = z.enum(["ACTIVE", "ARCHIVED"]);
export const currencyEnum = z.enum(["KRW", "USD", "EUR", "JPY"]);
export const billingCycleUnitEnum = z.enum(["WEEK", "MONTH", "YEAR"]);

const dateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid ISO date string",
});

export const createSubscriptionInput = z.object({
  name: z.string().min(1).max(80),
  icon: z.string().min(1).max(4),
  amount: z.number().nonnegative(),
  currency: currencyEnum.default("KRW"),
  cycleUnit: billingCycleUnitEnum,
  cycleInterval: z.number().int().min(1).default(1),
  startDate: dateString,
  nextPaymentDate: dateString,
  paymentMethod: z.string().max(100).optional(),
  memo: z.string().max(500).optional(),
  status: subscriptionStatusEnum.default("ACTIVE"),
});

export const updateSubscriptionInput = z
  .object({
    id: z.string(),
    name: z.string().min(1).max(80).optional(),
    icon: z.string().min(1).max(4).optional(),
    amount: z.number().nonnegative().optional(),
    currency: currencyEnum.optional(),
    cycleUnit: billingCycleUnitEnum.optional(),
    cycleInterval: z.number().int().min(1).optional(),
    startDate: dateString.optional(),
    nextPaymentDate: dateString.optional(),
    paymentMethod: z.string().max(100).optional(),
    memo: z.string().max(500).optional(),
    status: subscriptionStatusEnum.optional(),
  })
  .refine((data) => Object.keys(data).length > 1, {
    message: "At least one field other than id is required to update",
  });

export const subscriptionIdInput = z.object({
  id: z.string(),
});

export const listSubscriptionInput = z
  .object({
    status: subscriptionStatusEnum.optional(),
  })
  .optional();

export const appSettingsInput = z.object({
  language: z.string().min(2).max(5).optional(),
  currency: currencyEnum.optional(),
  defaultView: z.enum(["subscription", "stats", "alerts"]).optional(),
});
