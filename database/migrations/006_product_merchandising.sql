ALTER TABLE products ADD COLUMN IF NOT EXISTS material text NOT NULL DEFAULT 'See product details';
ALTER TABLE products ADD COLUMN IF NOT EXISTS fit text NOT NULL DEFAULT 'Unisex';
ALTER TABLE products ADD COLUMN IF NOT EXISTS care text NOT NULL DEFAULT 'Wash cold, inside out.';
