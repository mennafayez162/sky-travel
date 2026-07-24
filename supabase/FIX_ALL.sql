-- ============================================
-- FIX ALL - Run this ONCE in Supabase SQL Editor
-- 1. Creates storage bucket "images"
-- 2. Adds all missing _ar columns
-- 3. Adds all missing columns used by the app
-- ============================================

-- ====== STORAGE BUCKET ======
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to images bucket
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

-- ====== DESTINATIONS - add missing _ar columns ======
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS meta_title_ar VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS meta_description_ar TEXT;

-- ====== TRIPS - add missing columns ======
ALTER TABLE trips ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'EGP';
ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats INT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS travel_dates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- ====== BLOGS - add missing columns ======
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content_ar TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS tags_ar TEXT[];
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS author VARCHAR(255);

-- ====== REVIEWS - add missing columns ======
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment_ar TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_country VARCHAR(100);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true;

-- ====== OFFERS - add missing columns ======
ALTER TABLE offers ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ====== SERVICES - add missing columns ======
ALTER TABLE services ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS features_ar JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- ====== FAQ - add missing columns ======
ALTER TABLE faq ADD COLUMN IF NOT EXISTS question_ar TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS answer_ar TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE faq ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ====== CATEGORIES - add missing columns ======
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- ====== MESSAGES - add missing columns ======
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'unread';

-- ====== NEWSLETTER - add missing columns ======
ALTER TABLE newsletter ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ====== COUNTRIES - add missing columns ======
ALTER TABLE countries ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);

-- ====== SETTINGS - add all missing columns ======
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'EGP';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(5) DEFAULT 'ج.م';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_name_ar VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_title_ar VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_subtitle_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_badge VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_badge_ar VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS footer_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS footer_text_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_title VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_title_ar VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_description TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_description_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_image TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stats_clients INT DEFAULT 15000;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stats_destinations INT DEFAULT 500;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stats_trips INT DEFAULT 2500;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS stats_years INT DEFAULT 10;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS newsletter_title VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS newsletter_title_ar VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS newsletter_description TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS newsletter_description_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS google_maps_key TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS facebook VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS twitter VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS youtube VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon TEXT;

-- ====== GALLERY - add missing columns ======
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE gallery ALTER COLUMN image_url DROP NOT NULL;

-- ====== PROFILES - add missing columns ======
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ====== Disable RLS on all tables ======
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- ====== Fix old rows with null is_active ======
UPDATE destinations SET is_active = true WHERE is_active IS NULL;
UPDATE trips SET is_active = true WHERE is_active IS NULL;
UPDATE services SET is_active = true WHERE is_active IS NULL;
UPDATE offers SET is_active = true WHERE is_active IS NULL;
UPDATE faq SET is_active = true WHERE is_active IS NULL;
UPDATE newsletter SET is_active = true WHERE is_active IS NULL;

-- ====== Add name_ar to countries if missing ======
UPDATE countries SET name_ar = name WHERE name_ar IS NULL;

-- ====== MESSAGES - add reply columns ======
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;
