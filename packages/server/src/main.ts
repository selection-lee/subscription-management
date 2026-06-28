import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./router.ts";
import { createContext } from "./context.ts";

const app = express();

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`tRPC server listening on http://localhost:${port}/trpc`);
});
