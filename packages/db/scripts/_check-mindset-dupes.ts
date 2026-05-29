import { config as loadEnv } from 'dotenv'
loadEnv({ path: '../../.env.credentials' })
loadEnv()

import { prisma } from '../src'

const slugs = [
  "being-right-is-allowed-to-matter-less",
  "cancel-one-thing-this-week-with-kindness",
  "each-thought-a-leaf-on-a-river",
  "fear-of-success-origin-and-exit",
  "five-senses-scan-three-minutes",
  "forty-as-a-beginning",
  "how-to-trust-your-intuition",
  "i-am-allowed-to-become-new",
  "i-am-already-enough-i-have-always-been",
  "i-am-qualified-to-be-here",
  "i-get-to-redefine-what-good-mothering-means",
  "imposter-syndrome-origin-exit",
  "long-exhale-breath-for-perimenopause-anxiety",
  "mum-guilt-what-it-is-what-to-do",
  "my-anxiety-is-information-not-identity",
  "my-brain-is-changing-not-failing",
  "my-changing-sleep-is-not-my-failure",
  "my-gut-speaks-i-am-the-one-who-listens",
  "my-pain-is-real-i-deserve-good-care",
  "name-the-fear-sit-with-it",
  "new-moon-full-moon-two-monthly-anchors",
  "no-is-allowed-no-is-whole",
  "pleasure-is-not-theft",
  "resentment-as-a-slow-tax",
  "small-daily-home-rituals-that-change-everything",
  "sudden-vs-anticipated-loss",
  "tapping-for-always-behind",
  "tapping-for-chronic-pain",
  "tapping-for-fear-of-judgment",
  "tapping-for-hosting-anxiety",
  "tapping-for-imposter-syndrome",
  "tapping-for-i-should-be-over-it",
  "tapping-for-mum-guilt",
  "tapping-for-perimenopause-mood-swings",
  "tapping-for-permission-to-play",
  "tapping-for-the-wait-for-apology-trap",
  "tapping-for-turning-40",
  "tapping-to-begin-the-30-day-sleep-reset",
  "the-sunday-slow-morning",
  "the-ten-minute-reclaim-for-the-touched-out-mum",
  "try-one-thing-that-made-you-happy-as-a-teen",
  "what-anxiety-is-biologically",
  "what-does-my-body-want-me-to-know-about-the-change",
  "what-has-carrying-this-resentment-cost-me",
  "what-of-them-lives-in-me",
  "what-weekly-anchor-would-shape-my-whole-week",
  "what-wisdom-do-i-have-now-i-didnt-at-30",
  "when-a-friend-dies",
  "why-anxiety-hits-in-perimenopause",
  "why-women-say-yes",
  "write-what-i-believe-in-200-words",
];

async function main() {
  const today = new Date("2026-05-29T00:00:00.000Z");
  const rows = await prisma.tutorial.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, createdAt: true, status: true },
    orderBy: { createdAt: "asc" },
  });

  const preExisting = rows.filter((r) => r.createdAt < today);
  const newRows = rows.filter((r) => r.createdAt >= today);

  console.log(`Total found in DB: ${rows.length}`);
  console.log(`Pre-existing (createdAt < today): ${preExisting.length}`);
  console.log(`New today: ${newRows.length}`);
  console.log("\nPre-existing slugs:");
  for (const r of preExisting) {
    console.log(`  ${r.slug} (created: ${r.createdAt.toISOString().split("T")[0]})`);
  }
}

main().finally(() => prisma.$disconnect());
