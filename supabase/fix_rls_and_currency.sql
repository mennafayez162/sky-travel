-- ============================================
-- FIX RLS + ADD CURRENCY
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Disable RLS on ALL tables
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
ALTER TABLE destinations DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE gallery DISABLE ROW LEVEL SECURITY;
ALTER TABLE faq DISABLE ROW LEVEL SECURITY;
ALTER TABLE offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials DISABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE countries DISABLE ROW LEVEL SECURITY;
ALTER TABLE cities DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE trip_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs DISABLE ROW LEVEL SECURITY;

-- 2. Add currency columns to settings
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'EGP';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(5) DEFAULT 'ج.م';

-- 3. Run full_setup.sql extras (bilingual columns)
-- These are safe to run multiple times

-- settings bilingual
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_name_ar VARCHAR(255);
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

-- trips bilingual
ALTER TABLE trips ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats INT DEFAULT 20;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS gallery TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'EGP';

-- destinations bilingual
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- blogs bilingual
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- faq bilingual
ALTER TABLE faq ADD COLUMN IF NOT EXISTS question_ar TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS answer_ar TEXT;

-- offers bilingual
ALTER TABLE offers ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- reviews bilingual
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment_ar TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_country VARCHAR(100);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- gallery bilingual + fields
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE gallery ALTER COLUMN image_url DROP NOT NULL;

-- categories bilingual
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);

-- services bilingual + fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS features_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'EGP';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_bookings INT DEFAULT 50;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- bookings fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  role VARCHAR(255),
  role_ar VARCHAR(255),
  comment TEXT NOT NULL,
  comment_ar TEXT,
  avatar TEXT,
  rating INT DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- homepage_sections table
CREATE TABLE IF NOT EXISTS homepage_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_key VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255),
  title_ar VARCHAR(255),
  subtitle TEXT,
  subtitle_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO homepage_sections (section_key, title, title_ar, is_active, sort_order) VALUES
  ('hero', 'Hero', 'الرئيسية', true, 0),
  ('popular_destinations', 'Popular Destinations', 'الوجهات الأكثر شعبية', true, 1),
  ('featured_trips', 'Featured Trips', 'رحلات مميزة', true, 2),
  ('offers', 'Special Offers', 'عروض خاصة', true, 3),
  ('services', 'Our Services', 'خدماتنا', true, 4),
  ('testimonials', 'Testimonials', 'آراء العملاء', true, 5),
  ('gallery', 'Gallery', 'المعرض', true, 6),
  ('newsletter', 'Newsletter', 'النشرة الإخبارية', true, 7),
  ('partners', 'Partners', 'الشركاء', true, 8)
ON CONFLICT (section_key) DO NOTHING;

SELECT 'All done! RLS disabled + currency columns added + bilingual columns ready.' as result;
