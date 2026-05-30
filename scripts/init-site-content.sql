-- Textos e imágenes del sitio público (no tours)

CREATE TABLE IF NOT EXISTS site_settings (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (id, content)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
