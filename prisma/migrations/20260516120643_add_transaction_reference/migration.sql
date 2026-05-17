/*
  Warnings:

  - The values [flutterwave,paystack,stripe] on the enum `PaymentProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentProvider_new" AS ENUM ('mtn_momo', 'manual_bank');
ALTER TABLE "PaymentTransaction" ALTER COLUMN "provider" TYPE "PaymentProvider_new" USING ("provider"::text::"PaymentProvider_new");
ALTER TYPE "PaymentProvider" RENAME TO "PaymentProvider_old";
ALTER TYPE "PaymentProvider_new" RENAME TO "PaymentProvider";
DROP TYPE "public"."PaymentProvider_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "transactionReference" TEXT;
