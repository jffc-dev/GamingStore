/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `currency` on the `payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "payment_currency_enum" AS ENUM ('USD');

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_user_id_fkey";

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "currency",
ADD COLUMN     "currency" "payment_currency_enum" NOT NULL;

-- DropTable
DROP TABLE "notification";

-- DropEnum
DROP TYPE "notification_type_enum";
