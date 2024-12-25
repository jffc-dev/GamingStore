/*
  Warnings:

  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_detail" DROP CONSTRAINT "cart_detail_user_id_fkey";

-- DropTable
DROP TABLE "cart";

-- AddForeignKey
ALTER TABLE "cart_detail" ADD CONSTRAINT "cart_detail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "customer_user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION;
