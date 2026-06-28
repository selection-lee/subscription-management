import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context.ts";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router: typeof t.router = t.router;
export const publicProcedure: typeof t.procedure = t.procedure;
export const middleware: typeof t.middleware = t.middleware;
