BEGIN;
ALTER TYPE "MembershipStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TABLE "Payment" ALTER COLUMN "recurrentePaymentId" DROP NOT NULL;

-- Preserve existing plans, their references and any administrative deactivation.
LOCK TABLE "MembershipPlan" IN SHARE ROW EXCLUSIVE MODE;
INSERT INTO "MembershipPlan" ("id", "name", "durationDays", "price", "active")
SELECT gen_random_uuid()::text, p.name, p.days, p.price, true
FROM (VALUES ('Mensual', 30, 250), ('Anual', 365, 2400)) AS p(name, days, price)
WHERE NOT EXISTS (
  SELECT 1 FROM "MembershipPlan" existing WHERE lower(existing.name) = lower(p.name)
);
COMMIT;
