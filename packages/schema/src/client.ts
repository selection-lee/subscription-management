import { PrismaClient } from "../prisma/generated/prisma/client/index.js";

export const prisma = new PrismaClient();
export { PrismaClient };
