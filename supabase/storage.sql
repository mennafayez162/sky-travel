-- ============================================
-- SKY TRAVEL - Storage Setup
-- Run this AFTER creating the 'images' bucket in Supabase Dashboard
-- ============================================

-- Storage bucket policy: Allow public read access
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- Storage bucket policy: Allow authenticated uploads
CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'images');

-- Storage bucket policy: Allow authenticated updates
CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'images');

-- Storage bucket policy: Allow authenticated deletes
CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'images');
