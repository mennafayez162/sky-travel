-- ============================================
-- TRAVCANO - Full Dynamic CMS Migration
-- Adds bilingual columns + homepage settings
-- ============================================

-- ============================================
-- DESTINATIONS - Add bilingual columns
-- ============================================
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS meta_title_ar VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS meta_description_ar TEXT;

-- ============================================
-- TRIPS - Add bilingual columns
-- ============================================
ALTER TABLE trips ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS itinerary_ar JSONB;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats INT DEFAULT 20;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS travel_dates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- ============================================
-- SERVICES - Add bilingual columns
-- ============================================
ALTER TABLE services ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS features_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'EGP';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_bookings INT DEFAULT 50;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- BLOGS - Add bilingual columns
-- ============================================
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content_ar TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS tags_ar TEXT[];

-- ============================================
-- FAQ - Add bilingual columns
-- ============================================
ALTER TABLE faq ADD COLUMN IF NOT EXISTS question_ar TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS answer_ar TEXT;

-- ============================================
-- OFFERS - Add bilingual columns
-- ============================================
ALTER TABLE offers ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- ============================================
-- REVIEWS - Add bilingual columns
-- ============================================
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment_ar TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_country VARCHAR(100);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- ============================================
-- CATEGORIES - Add bilingual columns
-- ============================================
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- ============================================
-- COUNTRIES - Add bilingual columns
-- ============================================
ALTER TABLE countries ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);

-- ============================================
-- CITIES - Add bilingual columns
-- ============================================
ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);

-- ============================================
-- SETTINGS - Expand for full CMS control
-- ============================================
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_name_ar VARCHAR(255) DEFAULT 'ترافكانو';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS site_description_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_title VARCHAR(255) DEFAULT 'Discover Your Next Adventure';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_title_ar VARCHAR(255) DEFAULT 'اكتشف مغامرتك التالية';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'Premium travel experiences curated just for you.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_subtitle_ar TEXT DEFAULT 'تجارب سفر فاخرة مصممة خصيصاً لك.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_image TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_badge VARCHAR(255) DEFAULT 'Explore 500+ Destinations Worldwide';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS hero_badge_ar VARCHAR(255) DEFAULT 'استكشف أكثر من 500 وجهة حول العالم';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20) DEFAULT '#4F46E5';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(20) DEFAULT '#6D28D9';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS footer_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS footer_text_ar TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_title VARCHAR(255) DEFAULT 'About Us';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_title_ar VARCHAR(255) DEFAULT 'من نحن';
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

-- ============================================
-- TESTIMONIALS TABLE (if not exists)
-- ============================================
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

-- ============================================
-- HOMEPAGE SECTIONS TABLE
-- ============================================
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

-- Insert default homepage sections
INSERT INTO homepage_sections (section_key, title, title_ar, subtitle, subtitle_ar, is_active, sort_order) VALUES
  ('hero', 'Hero', 'الرئيسية', '', '', true, 0),
  ('popular_destinations', 'Popular Destinations', 'الوجهات الأكثر شعبية', 'Discover the world''s most breathtaking destinations', 'اكتشف أروع الوجهات في العالم', true, 1),
  ('featured_trips', 'Featured Trips', 'رحلات مميزة', 'Our most popular trips selected for extraordinary travel', 'أشهر رحلاتنا المختارة لتجارب سفر استثنائية', true, 2),
  ('offers', 'Special Offers', 'عروض خاصة', 'Grab these exclusive deals before they expire!', 'احصل على هذه العروض الحصرية قبل انتهاء صلاحيتها!', true, 3),
  ('services', 'Our Services', 'خدماتنا', 'Everything you need for a perfect trip', 'كل ما تحتاجه لرحلة مثيدة', true, 4),
  ('testimonials', 'Testimonials', 'آراء العملاء', 'What our travelers say', 'ماذا يقول مسافرونا', true, 5),
  ('gallery', 'Gallery', 'المعرض', 'Travel moments', 'لحظات السفر', true, 6),
  ('newsletter', 'Newsletter', 'النشرة الإخبارية', 'Stay updated', 'ابقَ على اطلاع', true, 7),
  ('partners', 'Partners', 'الشركاء', 'Trusted by leading brands', 'موثوق من أفضل العلامات التجارية', true, 8)
ON CONFLICT (section_key) DO NOTHING;

-- ============================================
-- BOOKINGS - Add service booking support
-- ============================================
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active);
CREATE INDEX IF NOT EXISTS idx_trips_active ON trips(is_active);
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);
CREATE INDEX IF NOT EXISTS idx_blogs_active ON blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_faq_active ON faq(is_active);
CREATE INDEX IF NOT EXISTS idx_reviews_visible ON reviews(is_visible);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(is_active);
CREATE INDEX IF NOT EXISTS idx_homepage_active ON homepage_sections(is_active);

-- ============================================
-- Set defaults
-- ============================================
ALTER TABLE settings ALTER COLUMN site_name SET DEFAULT 'Travcano';
ALTER TABLE settings ALTER COLUMN site_name_ar SET DEFAULT 'ترافكانو';
