-- ============================================
-- TRAVCANO - Complete Setup Script
-- Copy ALL of this and run in SQL Editor
-- ============================================

-- 1. Settings table - insert default row
INSERT INTO settings (id, site_name, site_name_ar, site_description, site_description_ar)
VALUES (1, 'Travcano', 'ترافكانو', 'Premium tourism and travel agency', 'وكالة سياحة وسفر فاخرة')
ON CONFLICT (id) DO NOTHING;

-- 2. Fix the auto-create profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role, is_active, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'name', 'User')),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create admin user directly
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Check if admin already exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@travcano.com') THEN
    -- Create auth user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@travcano.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Admin","role":"admin"}',
      NOW(), NOW()
    ) RETURNING id INTO admin_id;

    -- Create profile
    INSERT INTO profiles (id, full_name, email, role, is_active, created_at, updated_at)
    VALUES (admin_id, 'Admin', 'admin@travcano.com', 'admin', true, NOW(), NOW());
  ELSE
    -- Just make sure role is admin
    UPDATE profiles SET role = 'admin' WHERE email = 'admin@travcano.com';
  END IF;
END $$;

-- 4. Create testimonials table
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

-- 5. Create homepage_sections table
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

-- 6. Add bilingual columns to trips
ALTER TABLE trips ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS short_description_ar TEXT;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE trips ADD COLUMN IF NOT EXISTS available_seats INT DEFAULT 20;
ALTER TABLE trips ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- 7. Add bilingual columns to destinations
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS name_ar VARCHAR(255);
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- 8. Add bilingual columns to blogs
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS excerpt_ar TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS content_ar TEXT;

-- 9. Add bilingual columns to faq
ALTER TABLE faq ADD COLUMN IF NOT EXISTS question_ar TEXT;
ALTER TABLE faq ADD COLUMN IF NOT EXISTS answer_ar TEXT;

-- 10. Add bilingual columns to offers
ALTER TABLE offers ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE offers ADD COLUMN IF NOT EXISTS description_ar TEXT;

-- 11. Add bilingual columns to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment_ar TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_name VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS visitor_country VARCHAR(100);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 12. Add bilingual columns to categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);

-- 13. Add bilingual columns to countries
ALTER TABLE countries ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);

-- 14. Add bilingual columns to cities
ALTER TABLE cities ADD COLUMN IF NOT EXISTS name_ar VARCHAR(100);

-- 15. Expand settings table
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

-- 16. Add service_id to bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);

-- 17. Add bilingual columns to services
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

-- Done!
SELECT 'Setup complete! Admin: admin@travcano.com / Admin123!' as result;
