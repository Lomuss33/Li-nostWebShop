CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SEQUENCE IF NOT EXISTS purchase_request_number_seq;

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text NOT NULL UNIQUE, name text NOT NULL,
  short_description text NOT NULL DEFAULT '', description text NOT NULL DEFAULT '', category text NOT NULL,
  collection text NOT NULL DEFAULT '', featured boolean NOT NULL DEFAULT false, is_new boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku text NOT NULL UNIQUE, color text NOT NULL, size text NOT NULL, price_minor integer NOT NULL CHECK (price_minor >= 0),
  sale_price_minor integer CHECK (sale_price_minor IS NULL OR sale_price_minor >= 0), currency varchar(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0), active boolean NOT NULL DEFAULT true, weight_grams integer CHECK (weight_grams IS NULL OR weight_grams >= 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(product_id, color, size)
);
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  url_or_path text NOT NULL, alt_text text NOT NULL, position integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(product_id, position)
);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category); CREATE INDEX IF NOT EXISTS products_collection_idx ON products(collection);
CREATE INDEX IF NOT EXISTS variants_product_idx ON product_variants(product_id); CREATE INDEX IF NOT EXISTS variants_color_idx ON product_variants(color); CREATE INDEX IF NOT EXISTS variants_size_idx ON product_variants(size);

DO $$ BEGIN CREATE TYPE purchase_request_status AS ENUM ('NEW','REVIEWING','CONTACTED','WAITING_FOR_CUSTOMER','PAYMENT_LINK_SENT','CONVERTED_TO_ORDER','DECLINED','EXPIRED','CANCELLED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_number text NOT NULL UNIQUE DEFAULT ('REQ-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('purchase_request_number_seq')::text, 6, '0')),
  first_name text NOT NULL, last_name text NOT NULL, email text NOT NULL, phone text NOT NULL, country_code varchar(2) NOT NULL,
  preferred_contact_method text NOT NULL CHECK (preferred_contact_method IN ('email','phone','whatsapp','viber')), message text, currency varchar(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'), subtotal_minor integer NOT NULL CHECK (subtotal_minor >= 0),
  status purchase_request_status NOT NULL DEFAULT 'NEW', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS purchase_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), purchase_request_id uuid NOT NULL REFERENCES purchase_requests(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL, variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name_snapshot text NOT NULL, sku_snapshot text NOT NULL, color_snapshot text NOT NULL, size_snapshot text NOT NULL,
  unit_price_minor integer NOT NULL CHECK (unit_price_minor >= 0), quantity integer NOT NULL CHECK (quantity > 0), created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS purchase_requests_number_idx ON purchase_requests(request_number); CREATE INDEX IF NOT EXISTS purchase_requests_email_idx ON purchase_requests(email); CREATE INDEX IF NOT EXISTS purchase_requests_status_idx ON purchase_requests(status); CREATE INDEX IF NOT EXISTS purchase_requests_created_idx ON purchase_requests(created_at);
