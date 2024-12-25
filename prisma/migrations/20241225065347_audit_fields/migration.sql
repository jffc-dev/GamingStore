-- AlterTable
ALTER TABLE "cart_detail" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "category" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "deleted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "customer_user" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "deleted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "order" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "deleted_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "payment" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "product" ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "deleted_at" DROP DEFAULT;
