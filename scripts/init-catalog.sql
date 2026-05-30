-- Catálogo de experiencias (pasadías, paquetes, tours) y vínculo con reservas

CREATE TABLE IF NOT EXISTS tour_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES tour_categories(id) ON DELETE SET NULL,
  package_type VARCHAR(30) NOT NULL DEFAULT 'pasadia'
    CHECK (package_type IN ('pasadia', 'paquete', 'tour', 'experiencia')),
  badge VARCHAR(80),
  country VARCHAR(100) NOT NULL DEFAULT 'Colombia',
  location VARCHAR(255) NOT NULL,
  short_description TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  price_from_cents INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  rating NUMERIC(3, 2) NOT NULL DEFAULT 4.8,
  reviews_count INTEGER NOT NULL DEFAULT 0,
  duration_label VARCHAR(80) NOT NULL DEFAULT '',
  group_size_label VARCHAR(80) NOT NULL DEFAULT '',
  languages VARCHAR(80) NOT NULL DEFAULT 'ES',
  hero_image_url TEXT,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  includes JSONB NOT NULL DEFAULT '[]'::jsonb,
  excludes JSONB NOT NULL DEFAULT '[]'::jsonb,
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  long_description JSONB NOT NULL DEFAULT '[]'::jsonb,
  meeting_point TEXT,
  cancellation_policy TEXT,
  pricing_seasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  itinerary JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours (slug);
CREATE INDEX IF NOT EXISTS idx_tours_active ON tours (is_active);
CREATE INDEX IF NOT EXISTS idx_tours_category ON tours (category_id);

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS tour_id UUID REFERENCES tours(id) ON DELETE SET NULL;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS adults INTEGER NOT NULL DEFAULT 1;

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS children INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings (tour_id);
