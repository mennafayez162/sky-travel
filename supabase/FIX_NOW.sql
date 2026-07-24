-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE USING (bucket_id = 'images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE USING (bucket_id = 'images');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Settings columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS youtube VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_name_ar VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description_ar TEXT;

-- Messages reply columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- Disable RLS on all tables
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- Fix null is_active
UPDATE trips SET is_active = true WHERE is_active IS NULL;
UPDATE destinations SET is_active = true WHERE is_active IS NULL;
UPDATE services SET is_active = true WHERE is_active IS NULL;
UPDATE offers SET is_active = true WHERE is_active IS NULL;
UPDATE faq SET is_active = true WHERE is_active IS NULL;
