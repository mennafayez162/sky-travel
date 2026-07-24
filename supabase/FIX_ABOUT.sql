-- =============================================
-- ABOUT PAGE: Story, Values, Team Members
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Add story columns to settings (if not exist)
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_label VARCHAR(255) DEFAULT 'Our Story';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_label_ar VARCHAR(255) DEFAULT 'قصتنا';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_title VARCHAR(255) DEFAULT 'Discover Our Journey';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_title_ar VARCHAR(255) DEFAULT 'اكتشف رحلتنا';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_paragraph1 TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_paragraph1_ar TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_paragraph2 TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_paragraph2_ar TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_paragraph3 TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_paragraph3_ar TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_image TEXT DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_years_label VARCHAR(255) DEFAULT 'Years Experience';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_years_label_ar VARCHAR(255) DEFAULT 'سنوات خبرة';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_years_number INT DEFAULT 10;

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255),
  role VARCHAR(255) NOT NULL,
  role_ar VARCHAR(255),
  image TEXT DEFAULT '',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create about_values table
CREATE TABLE IF NOT EXISTS about_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  title_ar VARCHAR(255),
  description TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  icon VARCHAR(100) DEFAULT 'FiTarget',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Disable RLS
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE about_values DISABLE ROW LEVEL SECURITY;

-- No seed data: everything managed from Admin Dashboard
