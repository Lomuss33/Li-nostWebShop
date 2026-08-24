CREATE TABLE IF NOT EXISTS market_country_settings (
  country_code varchar(2) PRIMARY KEY,
  market_id text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  online_checkout boolean NOT NULL DEFAULT false,
  purchase_request boolean NOT NULL DEFAULT true,
  currency varchar(3) NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR','USD','CHF')),
  customs_mode text NOT NULL DEFAULT 'NONE' CHECK (customs_mode IN ('NONE','DAP','DDP')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS shipping_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id text NOT NULL,
  name text NOT NULL,
  carrier_label text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  currency varchar(3) NOT NULL CHECK (currency IN ('EUR','USD','CHF')),
  price_minor integer NOT NULL CHECK (price_minor >= 0),
  free_shipping_threshold_minor integer CHECK (free_shipping_threshold_minor IS NULL OR free_shipping_threshold_minor >= 0),
  minimum_weight_grams integer CHECK (minimum_weight_grams IS NULL OR minimum_weight_grams >= 0),
  maximum_weight_grams integer CHECK (maximum_weight_grams IS NULL OR maximum_weight_grams >= 0),
  estimated_days_min integer NOT NULL CHECK (estimated_days_min >= 0),
  estimated_days_max integer NOT NULL CHECK (estimated_days_max >= estimated_days_min),
  tracking_supported boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS shipping_methods_market_idx ON shipping_methods(market_id, enabled);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tax_category text NOT NULL DEFAULT 'STANDARD';
ALTER TABLE products ADD COLUMN IF NOT EXISTS country_of_origin varchar(2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS customs_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS hs_code text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_calculation_mode text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_jurisdiction text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_rate_basis text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prices_include_tax boolean;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_snapshot text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customs_snapshot_json jsonb;
CREATE TABLE IF NOT EXISTS merchant_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id), merchant_country varchar(2) NOT NULL DEFAULT 'DE', vat_registered boolean NOT NULL DEFAULT false,
  oss_registered boolean NOT NULL DEFAULT false, prices_include_tax boolean NOT NULL DEFAULT false, tax_mode text NOT NULL DEFAULT 'DEVELOPMENT_ZERO' CHECK (tax_mode IN ('DEVELOPMENT_ZERO','MANUAL_CONFIG','PROVIDER')),
  manual_tax_rate_bps integer NOT NULL DEFAULT 0 CHECK (manual_tax_rate_bps >= 0), legal_business_name text, legal_form text, legal_street text, legal_postal_code text, legal_city text, legal_country varchar(2), legal_email text, support_email text, updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO merchant_settings (id) VALUES (true) ON CONFLICT (id) DO NOTHING;
INSERT INTO market_country_settings (country_code,market_id,enabled,online_checkout,purchase_request,currency,customs_mode) VALUES
('DE','GERMANY',true,true,true,'EUR','NONE'),('AT','EU',true,true,true,'EUR','NONE'),('HR','EU',true,true,true,'EUR','NONE'),('SI','EU',true,true,true,'EUR','NONE'),('FR','EU',true,true,true,'EUR','NONE'),('IT','EU',true,true,true,'EUR','NONE'),('ES','EU',true,true,true,'EUR','NONE'),('NL','EU',true,true,true,'EUR','NONE'),('BE','EU',true,true,true,'EUR','NONE'),('LU','EU',true,true,true,'EUR','NONE'),('IE','EU',true,true,true,'EUR','NONE'),('PT','EU',true,true,true,'EUR','NONE'),('PL','EU',true,true,true,'EUR','NONE'),('CZ','EU',true,true,true,'EUR','NONE'),('SK','EU',true,true,true,'EUR','NONE'),('HU','EU',true,true,true,'EUR','NONE'),('RO','EU',true,true,true,'EUR','NONE'),('BG','EU',true,true,true,'EUR','NONE'),('GR','EU',true,true,true,'EUR','NONE'),('SE','EU',true,true,true,'EUR','NONE'),('FI','EU',true,true,true,'EUR','NONE'),('DK','EU',true,true,true,'EUR','NONE'),('EE','EU',true,true,true,'EUR','NONE'),('LV','EU',true,true,true,'EUR','NONE'),('LT','EU',true,true,true,'EUR','NONE'),('CY','EU',true,true,true,'EUR','NONE'),('MT','EU',true,true,true,'EUR','NONE'),('BA','BALKANS_NON_EU',true,false,true,'EUR','DAP'),('RS','BALKANS_NON_EU',true,false,true,'EUR','DAP'),('ME','BALKANS_NON_EU',true,false,true,'EUR','DAP'),('MK','BALKANS_NON_EU',true,false,true,'EUR','DAP'),('AL','BALKANS_NON_EU',true,false,true,'EUR','DAP'),('XK','BALKANS_NON_EU',false,false,true,'EUR','DAP'),('CH','SWITZERLAND',false,false,true,'CHF','DAP'),('US','USA',false,false,true,'USD','DAP')
ON CONFLICT (country_code) DO NOTHING;
INSERT INTO shipping_methods (market_id,name,carrier_label,currency,price_minor,estimated_days_min,estimated_days_max) VALUES
('GERMANY','Tracked delivery','Carrier to be selected','EUR',490,1,3),('EU','Tracked delivery','Carrier to be selected','EUR',900,3,7),('BALKANS_NON_EU','International tracked delivery','Carrier to be selected','EUR',1200,5,12),('SWITZERLAND','International tracked delivery','Carrier to be selected','CHF',1400,4,8),('USA','International tracked delivery','Carrier to be selected','USD',1800,5,10)
ON CONFLICT DO NOTHING;
