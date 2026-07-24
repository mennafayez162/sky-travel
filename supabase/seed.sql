-- ============================================
-- SKY TRAVEL - Seed Data
-- ============================================

-- Sample Countries
INSERT INTO countries (name, slug, code, image) VALUES
  ('Maldives', 'maldives', 'MV', 'https://images.unsplash.com/photo-1514282401047-d79a71a3934d?w=800'),
  ('France', 'france', 'FR', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'),
  ('Japan', 'japan', 'JP', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'),
  ('UAE', 'uae', 'AE', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800'),
  ('Italy', 'italy', 'IT', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800'),
  ('Thailand', 'thailand', 'TH', 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=800'),
  ('Turkey', 'turkey', 'TR', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800'),
  ('Egypt', 'egypt', 'EG', 'https://images.unsplash.com/photo-1539768942893-daf53e736b68?w=800');

-- Sample Cities
INSERT INTO cities (name, slug, country_id) VALUES
  ('Male', 'male', (SELECT id FROM countries WHERE slug = 'maldives')),
  ('Paris', 'paris', (SELECT id FROM countries WHERE slug = 'france')),
  ('Tokyo', 'tokyo', (SELECT id FROM countries WHERE slug = 'japan')),
  ('Dubai', 'dubai', (SELECT id FROM countries WHERE slug = 'uae')),
  ('Rome', 'rome', (SELECT id FROM countries WHERE slug = 'italy')),
  ('Bangkok', 'bangkok', (SELECT id FROM countries WHERE slug = 'thailand')),
  ('Istanbul', 'istanbul', (SELECT id FROM countries WHERE slug = 'turkey')),
  ('Cairo', 'cairo', (SELECT id FROM countries WHERE slug = 'egypt'));

-- Sample Categories
INSERT INTO categories (name, slug, type) VALUES
  ('Travel Tips', 'travel-tips', 'blog'),
  ('Destinations', 'destinations-blog', 'blog'),
  ('Adventure', 'adventure', 'blog'),
  ('Luxury Travel', 'luxury-travel', 'blog'),
  ('Beach', 'beach', 'gallery'),
  ('Mountains', 'mountains', 'gallery'),
  ('City Life', 'city-life', 'gallery'),
  ('Culture', 'culture', 'gallery');

-- Sample Services
INSERT INTO services (title, slug, description, icon, sort_order) VALUES
  ('Flight Booking', 'flight-bookings', 'Book flights to any destination worldwide with the best airlines.', 'FaPlane', 1),
  ('Hotel Booking', 'hotel-bookings', 'Find and book luxury hotels and resorts at best prices.', 'FaHotel', 2),
  ('Visa Services', 'visa-services', 'Get assistance with visa applications for any country.', 'FaPassport', 3),
  ('Travel Insurance', 'travel-insurance', 'Comprehensive travel insurance for peace of mind.', 'FaShieldAlt', 4),
  ('Airport Pickup', 'airport-pickup', 'Reliable airport transfer services worldwide.', 'FaCar', 5),
  ('Luxury Cars', 'luxury-cars', 'Rent premium luxury cars for your trip.', 'FaCarSide', 6),
  ('Tour Guide', 'tour-guide', 'Professional local tour guides for authentic experiences.', 'FaUserTie', 7),
  ('Cruise', 'cruise', 'Luxury cruise packages to exotic destinations.', 'FaShip', 8),
  ('Corporate Trips', 'corporate-trips', 'Business travel solutions for your company.', 'FaBuilding', 9);

-- Sample FAQ
INSERT INTO faq (question, answer, category, sort_order) VALUES
  ('How do I book a trip?', 'You can book a trip by browsing our trips page, selecting your desired trip, and following the booking process. You can also contact us directly for personalized assistance.', 'Booking', 1),
  ('What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, Amex), PayPal, and bank transfers. All payments are securely processed.', 'Payment', 2),
  ('Can I cancel or modify my booking?', 'Yes, you can cancel or modify your booking up to 48 hours before the travel date. Cancellation fees may apply depending on the trip policy.', 'Booking', 3),
  ('Do I need travel insurance?', 'We strongly recommend travel insurance for all trips. It covers medical emergencies, trip cancellations, and lost luggage.', 'Insurance', 4),
  ('What is included in the trip packages?', 'Most of our packages include accommodation, flights, airport transfers, and guided tours. Specific inclusions are listed on each trip page.', 'Packages', 5),
  ('How do I get my visa?', 'Our visa services team will guide you through the entire process. Contact us with your destination and we will provide all required information.', 'Visa', 6),
  ('Do you offer group discounts?', 'Yes, we offer special group rates for parties of 10 or more. Contact us for a custom quote.', 'Pricing', 7),
  ('What is your refund policy?', 'Refunds are processed within 5-10 business days. The refund amount depends on the cancellation timing and trip terms.', 'Payment', 8);

-- Sample Settings
INSERT INTO settings (id, site_name, site_description, phone, email, address, whatsapp) VALUES
  (1, 'Sky Travel', 'Premium Tourism & Travel Agency', '+1 234 567 890', 'info@skytravel.com', '123 Travel Street, Tourism City, TC 12345', '+1234567890');
