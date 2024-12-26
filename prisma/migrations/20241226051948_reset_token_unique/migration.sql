/*
  Warnings:

  - A unique constraint covering the columns `[reset_password_token]` on the table `customer_user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "customer_user_reset_password_token_key" ON "customer_user"("reset_password_token");
