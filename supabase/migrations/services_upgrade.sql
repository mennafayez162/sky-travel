-- ============================================
-- TRAVCANO - Services Table Upgrade
-- Run this AFTER the main schema.sql
-- ============================================

-- Add new columns to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS title_ar VARCHAR(255);
ALTER TABLE services ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_currency VARCHAR(10) DEFAULT 'EGP';
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration VARCHAR(50);
ALTER TABLE services ADD COLUMN IF NOT EXISTS highlights TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS highlights_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS includes TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS includes_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS excludes TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS excludes_ar TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS itinerary JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE services ADD COLUMN IF NOT EXISTS gallery TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_bookings INT DEFAULT 50;
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255);
ALTER TABLE services ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add service_id to bookings table for service bookings
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_service ON bookings(service_id);

-- Update settings default
ALTER TABLE settings ALTER COLUMN site_name SET DEFAULT 'Travcano';
