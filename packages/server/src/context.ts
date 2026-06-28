import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";

export type Context = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
};

export async function createContext({ req, res }: CreateExpressContextOptions): Promise<Context> {
  return {
    req,
    res,
  };
}
