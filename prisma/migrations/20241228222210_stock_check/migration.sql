-- This is an empty migration.
ALTER TABLE public.product
    ADD CONSTRAINT check_stock
        CHECK (stock >= 0);