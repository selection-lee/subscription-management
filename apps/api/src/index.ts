import path from "node:path";
import dotenvx from "@dotenvx/dotenvx";
// 실행 방식(node --watch / start)과 무관하게 모노레포 루트 .env 로드
dotenvx.config({ path: path.resolve(import.meta.dirname, "../../../.env"), quiet: true });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { appRouter, createContext } from "@lib/server";

const app = express();
const port = process.env["PORT"] ?? 3000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(express.json());

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`API server running on http://localhost:${port}`);
});
