/*
  Warnings:

  - The primary key for the `order_detail` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "order_detail" DROP CONSTRAINT "order_detail_pkey",
ADD CONSTRAINT "order_detail_pkey" PRIMARY KEY ("order_id", "order_detail_id");
