/*
  Warnings:

  - You are about to drop the `product_category` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_category_id_fkey";

-- DropForeignKey
ALTER TABLE "product_category" DROP CONSTRAINT "product_category_product_id_fkey";

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "category_id" UUID NOT NULL;

-- DropTable
DROP TABLE "product_category";

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
