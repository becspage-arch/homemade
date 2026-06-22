-- Stripe billing (Session F).
-- Additive only: one new nullable column on User (the Stripe customer link)
-- plus the Subscription mirror table. No existing data changes — every current
-- row keeps stripeCustomerId NULL and owns no Subscription rows until they buy.
-- We own billing state in our own DB (continuity safeguard #1): the Stripe
-- webhook is the only writer.

ALTER TABLE "User" ADD COLUMN "stripeCustomerId" TEXT;

CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT NOT NULL,
    "stripePriceId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "plan" TEXT,
    "currency" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "canceledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

CREATE INDEX "Subscription_stripeCustomerId_idx" ON "Subscription"("stripeCustomerId");

CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
