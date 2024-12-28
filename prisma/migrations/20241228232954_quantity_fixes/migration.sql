/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `is_deleted` on the `order` table. All the data in the column will be lost.
  - Made the column `quantity` on table `cart_detail` required. This step will fail if there are existing NULL values in that column.
  - Made the column `quantity` on table `order_detail` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "cart_detail" ALTER COLUMN "quantity" SET NOT NULL;

-- AlterTable
ALTER TABLE "order" DROP COLUMN "deleted_at",
DROP COLUMN "is_deleted";

-- AlterTable
ALTER TABLE "order_detail" ALTER COLUMN "quantity" SET NOT NULL;
