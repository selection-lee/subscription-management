import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const LOCAL_USER_EMAIL = "local@subscription-management.local";

// 앱의 날짜 저장 방식(new Date("YYYY-MM-DD") = UTC 자정)과 일치시킴
function addDays(days: number) {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days));
}

type Seed = {
  name: string;
  icon: string;
  amount: number;
  currency: "KRW" | "USD" | "EUR" | "JPY";
  cycleUnit: "WEEK" | "MONTH" | "YEAR";
  cycleInterval: number;
  nextInDays: number;
  startedDaysAgo: number;
  paymentMethod?: string;
  memo?: string;
  status?: "ACTIVE" | "ARCHIVED";
  archivedDaysAgo?: number;
};

const SEEDS: Seed[] = [
  { name: "Notion Pro", icon: "💼", amount: 10000, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 0, startedDaysAgo: 400, memo: "팀 워크스페이스" },
  { name: "YouTube Premium", icon: "▶️", amount: 14900, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 1, startedDaysAgo: 200 },
  { name: "Netflix", icon: "📺", amount: 17000, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 3, startedDaysAgo: 500, paymentMethod: "신한카드 •••• 1234" },
  { name: "Adobe Creative", icon: "🎨", amount: 26900, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 6, startedDaysAgo: 90 },
  { name: "Apple One", icon: "🍎", amount: 9900, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 8, startedDaysAgo: 365 },
  { name: "ChatGPT Plus", icon: "🤖", amount: 20, currency: "USD", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 12, startedDaysAgo: 120, memo: "외화 결제" },
  { name: "Spotify Premium", icon: "🎵", amount: 13900, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 18, startedDaysAgo: 430, memo: "가족과 듀오 플랜" },
  { name: "iCloud 200GB", icon: "☁️", amount: 1400, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 22, startedDaysAgo: 700 },
  { name: "Amazon Prime", icon: "📦", amount: 89000, currency: "KRW", cycleUnit: "YEAR", cycleInterval: 1, nextInDays: 45, startedDaysAgo: 320 },
  { name: "Apple Music", icon: "🎧", amount: 8900, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 30, startedDaysAgo: 600, status: "ARCHIVED", archivedDaysAgo: 160 },
  { name: "Xbox Game Pass", icon: "🎮", amount: 9900, currency: "KRW", cycleUnit: "MONTH", cycleInterval: 1, nextInDays: 30, startedDaysAgo: 450, status: "ARCHIVED", archivedDaysAgo: 250 },
];

async function main() {
  const user = await prisma.user.upsert({
    where: { email: LOCAL_USER_EMAIL },
    create: { email: LOCAL_USER_EMAIL },
    update: {},
  });

  // 멱등: 기존 구독 제거 후 재생성
  await prisma.subscription.deleteMany({ where: { userId: user.id } });

  for (const s of SEEDS) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        name: s.name,
        icon: s.icon,
        amount: s.amount,
        currency: s.currency,
        cycleUnit: s.cycleUnit,
        cycleInterval: s.cycleInterval,
        startDate: addDays(-s.startedDaysAgo),
        nextPaymentDate: addDays(s.nextInDays),
        paymentMethod: s.paymentMethod ?? null,
        memo: s.memo ?? null,
        status: s.status ?? "ACTIVE",
        archivedAt: s.archivedDaysAgo ? addDays(-s.archivedDaysAgo) : null,
      },
    });
  }

  const active = SEEDS.filter((s) => (s.status ?? "ACTIVE") === "ACTIVE").length;
  const archived = SEEDS.length - active;
  console.log(`✔ Seeded ${SEEDS.length} subscriptions (${active} active, ${archived} archived) for ${LOCAL_USER_EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
