-- ============================================================
-- WeBookMountains — Supabase SQL Schema + Seed Data
-- Run this entire file in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Users table (custom auth — no Supabase Auth used)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(30) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'guide', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guides profile table (one per guide user)
CREATE TABLE IF NOT EXISTS guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  experience_years INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  rating NUMERIC(3,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_trips INTEGER DEFAULT 0,
  payout_account_set BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  guide_id UUID NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  mountain VARCHAR(100) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  duration_days INTEGER NOT NULL,
  max_participants INTEGER DEFAULT 8,
  price_per_person NUMERIC(10,2) NOT NULL,
  deposit_percent INTEGER DEFAULT 30,
  cancellation_policy VARCHAR(20) DEFAULT 'moderate' CHECK (cancellation_policy IN ('flexible', 'moderate', 'strict')),
  includes TEXT[] DEFAULT '{}',
  requirements TEXT[] DEFAULT '{}',
  meeting_point TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trip_id UUID NOT NULL REFERENCES trips(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  guide_id UUID NOT NULL REFERENCES guides(id),
  trip_date DATE NOT NULL,
  participants INTEGER NOT NULL DEFAULT 1,
  total_amount NUMERIC(10,2) NOT NULL,
  deposit_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'disputed')),
  payment_status VARCHAR(30) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'deposit_paid', 'fully_paid', 'refunded', 'failed')),
  special_requests TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  trip_id UUID NOT NULL REFERENCES trips(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  guide_id UUID NOT NULL REFERENCES guides(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  issue_type VARCHAR(30) NOT NULL CHECK (issue_type IN ('refund', 'guide_conduct', 'trip_quality', 'safety', 'other')),
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'closed')),
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;

-- Since we use custom JWT auth (not Supabase Auth), 
-- we use service_role key server-side only.
-- Public read for trips, guides, reviews via anon key:

CREATE POLICY "trips_public_read" ON trips
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "guides_public_read" ON guides
  FOR SELECT USING (TRUE);

CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT USING (TRUE);

-- All other operations go through service_role (server-side API routes)
-- which bypasses RLS entirely. This is intentional — our API handles 
-- all authorization logic in route handlers.

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_trips_guide_id ON trips(guide_id);
CREATE INDEX IF NOT EXISTS idx_trips_is_active ON trips(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guide_id ON bookings(guide_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_trip_id ON reviews(trip_id);
CREATE INDEX IF NOT EXISTS idx_reviews_guide_id ON reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raised_by ON disputes(raised_by);
CREATE INDEX IF NOT EXISTS idx_guides_user_id ON guides(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================================
-- SEED DATA
-- ============================================================
-- Passwords are all: "password123"
-- bcrypt hash of "password123" with 12 rounds:
-- $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu

-- ============================================================
-- SEED USERS
-- ============================================================

INSERT INTO users (id, username, password_hash, full_name, role) VALUES
  -- Customers
  ('11111111-1111-1111-1111-111111111001', 'alex_hiker', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'Alex Morrison', 'customer'),
  ('11111111-1111-1111-1111-111111111002', 'sara_peaks', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'Sara Chen', 'customer'),
  ('11111111-1111-1111-1111-111111111003', 'james_summit', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'James O''Brien', 'customer'),
  ('11111111-1111-1111-1111-111111111004', 'priya_climbs', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'Priya Sharma', 'customer'),
  -- Guides
  ('11111111-1111-1111-1111-111111111010', 'hassan_guide', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'Hassan Khan', 'guide'),
  ('11111111-1111-1111-1111-111111111011', 'imran_peaks', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'Imran Baig', 'guide'),
  ('11111111-1111-1111-1111-111111111012', 'fatima_guide', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2NfKSn8vJu', 'Fatima Malik', 'guide')
ON CONFLICT (username) DO NOTHING;

-- ============================================================
-- SEED GUIDES
-- ============================================================

INSERT INTO guides (id, user_id, bio, experience_years, specialties, certifications, is_verified, verification_status, rating, total_reviews, total_trips, payout_account_set) VALUES
  (
    '22222222-2222-2222-2222-222222222001',
    '11111111-1111-1111-1111-111111111010',
    'Born and raised in Skardu, I have spent 18 years guiding expeditions across the Karakoram. I have summited K2 twice and led over 200 successful expeditions. Safety is everything to me — I have never lost a client.',
    18,
    ARRAY['High altitude', 'Technical climbing', 'Glacier travel', 'Crevasse rescue'],
    ARRAY['UIAGM Mountain Guide', 'Wilderness First Responder', 'Pakistan Alpine Club Certified', 'Rope rescue technician'],
    TRUE,
    'approved',
    4.9,
    47,
    89,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222002',
    '11111111-1111-1111-1111-111111111011',
    'Expert in trekking routes across Gilgit-Baltistan. Specializing in moderate treks and base camp expeditions, I focus on making the mountains accessible for beginners while maintaining the highest safety standards.',
    12,
    ARRAY['Trekking', 'Base camp expeditions', 'Photography tours', 'Winter mountaineering'],
    ARRAY['Pakistan Tourism Authority Certified', 'Basic Life Support', 'Leave No Trace Trainer'],
    TRUE,
    'approved',
    4.7,
    32,
    58,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222003',
    '11111111-1111-1111-1111-111111111012',
    'Pakistan''s first female high-altitude guide certified by UIAGM. I specialize in women-only expeditions and mixed groups across Nanga Parbat and Rakaposhi. Passionate about making mountaineering inclusive.',
    9,
    ARRAY['High altitude', 'Women-led expeditions', 'Cultural tours', 'Acclimatization programs'],
    ARRAY['UIAGM Mountain Guide', 'Wilderness First Aid', 'Avalanche Level 2'],
    TRUE,
    'approved',
    4.8,
    28,
    41,
    FALSE
  )
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================
-- SEED TRIPS
-- ============================================================

INSERT INTO trips (id, guide_id, title, description, mountain, difficulty, duration_days, max_participants, price_per_person, deposit_percent, cancellation_policy, includes, requirements, meeting_point, image_url, is_active) VALUES
  (
    '33333333-3333-3333-3333-333333333001',
    '22222222-2222-2222-2222-222222222001',
    'K2 Base Camp Expedition',
    'The ultimate trekking experience — a 12-day journey to the base of the world''s second-highest mountain. You will trek through stunning Baltoro Glacier, passing Concordia and the Cathedral Spires, before arriving at K2 Base Camp at 5,150m. This is a serious high-altitude expedition with acclimatization days built in. The views of K2''s South Face are unlike anything on earth.',
    'K2',
    'advanced',
    12,
    8,
    2400.00,
    30,
    'moderate',
    ARRAY['All camping equipment', 'Experienced high-altitude porters', 'All meals during trek', 'Permits and fees', 'Emergency oxygen cylinder', 'Satellite phone access', 'First aid kit'],
    ARRAY['Must have prior trekking experience above 4000m', 'Good physical fitness — cardio training 3+ months before', 'Travel insurance covering helicopter evacuation mandatory', 'No heart or respiratory conditions'],
    'Skardu Airport, Baltistan, Pakistan',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    TRUE
  ),
  (
    '33333333-3333-3333-3333-333333333002',
    '22222222-2222-2222-2222-222222222001',
    'Concordia & Gasherbrum Base Camp',
    'Trek to the heart of the Karakoram — Concordia, where four 8,000m peaks converge. Starting from Askole, you''ll traverse the legendary Baltoro Glacier for 8 days, camping at iconic spots like Urdukas and Goro II. Concordia offers a 360-degree view of Broad Peak, Gasherbrum IV, K2, and Mitre Peak. An optional extension to Gasherbrum Base Camp is included.',
    'Gasherbrum I',
    'advanced',
    10,
    6,
    1950.00,
    30,
    'moderate',
    ARRAY['All camping gear and tents', 'Cook and kitchen crew', 'All meals', 'Glacier crossing equipment', 'Park permits', 'Porters to carry group equipment'],
    ARRAY['Prior glacier trekking experience preferred', 'Good cardiovascular fitness required', 'Helicopter evacuation insurance mandatory', 'Minimum age 18'],
    'Skardu City, Pakistan',
    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=800&q=80',
    TRUE
  ),
  (
    '33333333-3333-3333-3333-333333333003',
    '22222222-2222-2222-2222-222222222002',
    'Nanga Parbat Base Camp Trek',
    'Trek to the base of Nanga Parbat, the ninth-highest mountain and the world''s deadliest. This moderate trek approaches from the Rupal Face, the world''s highest mountain face at 4,600m. The route passes through alpine meadows, crystal streams, and dramatic moraine valleys. Suitable for fit beginners with some prior trekking experience.',
    'Nanga Parbat',
    'intermediate',
    7,
    10,
    850.00,
    25,
    'flexible',
    ARRAY['Camping equipment', 'All meals', 'Experienced trekking guide', 'Permits', 'First aid supplies', 'Jeep transfers from Chilas'],
    ARRAY['Moderate fitness level', 'Some prior trekking experience recommended', 'Own sleeping bag required', 'Travel insurance with emergency coverage'],
    'Chilas, Gilgit-Baltistan, Pakistan',
    'https://images.unsplash.com/photo-1606210428862-0b9d4e8a9d32?w=800&q=80',
    TRUE
  ),
  (
    '33333333-3333-3333-3333-333333333004',
    '22222222-2222-2222-2222-222222222002',
    'Rakaposhi Base Camp & Summit View',
    'A stunning 5-day trek to the base of Rakaposhi, with a viewpoint at 4,800m offering one of the most dramatic mountain panoramas in Pakistan. Starting from Minapin village, the trail winds through ancient forests, glacial streams, and alpine pastures. Perfect for intermediate trekkers looking for their first high-altitude experience.',
    'Rakaposhi',
    'intermediate',
    5,
    12,
    650.00,
    25,
    'flexible',
    ARRAY['Tent accommodation', 'All meals', 'Trekking guide', 'Entrance permits', 'Transport from Gilgit'],
    ARRAY['Reasonably fit — 4-5 hours walking per day', 'Own trekking poles recommended', 'Layered clothing for cold nights', 'No specific prior experience needed'],
    'Gilgit Airport, Pakistan',
    'https://images.unsplash.com/photo-1570641963303-92ce4845ed4c?w=800&q=80',
    TRUE
  ),
  (
    '33333333-3333-3333-3333-333333333005',
    '22222222-2222-2222-2222-222222222003',
    'Nanga Parbat — Women''s Expedition',
    'A women-only guided expedition to Nanga Parbat Base Camp led by Pakistan''s first female UIAGM-certified guide. This 8-day journey combines challenging trekking with cultural immersion in local Gilgit-Baltistani villages. Small group (max 8), strong emphasis on safety, acclimatization, and building confidence at altitude.',
    'Nanga Parbat',
    'intermediate',
    8,
    8,
    1100.00,
    30,
    'moderate',
    ARRAY['All camping equipment', 'Meals throughout', 'Female guide and support staff', 'Cultural village visit', 'Permits', 'Emergency kit'],
    ARRAY['Open to all fitness levels with preparation', '8-week training plan provided on booking', 'Women only', 'Minimum age 16'],
    'Islamabad Airport, Pakistan',
    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&q=80',
    TRUE
  ),
  (
    '33333333-3333-3333-3333-333333333006',
    '22222222-2222-2222-2222-222222222003',
    'Tirich Mir Base Camp — Explorer Trek',
    'Tirich Mir is the highest peak of the Hindu Kush at 7,708m and one of Pakistan''s most remote summits. This 9-day expedition takes you through the Chitral valley and up to base camp. Very few trekkers ever reach this base camp, making it one of the most exclusive and rewarding treks in Pakistan.',
    'Tirich Mir',
    'advanced',
    9,
    6,
    1600.00,
    35,
    'strict',
    ARRAY['Full camping setup', 'All meals', 'Local cultural guides', 'Permits and security clearance', 'Jeep transport', 'Satellite communication device'],
    ARRAY['Prior high-altitude trekking above 4500m required', 'Excellent fitness mandatory', 'Pakistani NADRA clearance may be required', 'Travel insurance with helicopter evacuation mandatory', 'Minimum age 21'],
    'Chitral Airport, Khyber Pakhtunkhwa, Pakistan',
    'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
    TRUE
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED BOOKINGS
-- ============================================================

-- Confirmed upcoming booking
INSERT INTO bookings (id, trip_id, customer_id, guide_id, trip_date, participants, total_amount, deposit_amount, status, payment_status) VALUES
  (
    '44444444-4444-4444-4444-444444444001',
    '33333333-3333-3333-3333-333333333001',
    '11111111-1111-1111-1111-111111111001',
    '22222222-2222-2222-2222-222222222001',
    (CURRENT_DATE + INTERVAL '45 days')::date,
    2,
    4800.00,
    1440.00,
    'confirmed',
    'deposit_paid'
  ),
  -- Pending booking (within a week — guide hasn't confirmed)
  (
    '44444444-4444-4444-4444-444444444002',
    '33333333-3333-3333-3333-333333333003',
    '11111111-1111-1111-1111-111111111002',
    '22222222-2222-2222-2222-222222222002',
    (CURRENT_DATE + INTERVAL '30 days')::date,
    3,
    2550.00,
    637.50,
    'pending',
    'pending'
  ),
  -- Completed booking (past trip — can leave review)
  (
    '44444444-4444-4444-4444-444444444003',
    '33333333-3333-3333-3333-333333333004',
    '11111111-1111-1111-1111-111111111001',
    '22222222-2222-2222-2222-222222222002',
    (CURRENT_DATE - INTERVAL '60 days')::date,
    1,
    650.00,
    162.50,
    'completed',
    'fully_paid'
  ),
  -- Completed booking with review
  (
    '44444444-4444-4444-4444-444444444004',
    '33333333-3333-3333-3333-333333333003',
    '11111111-1111-1111-1111-111111111003',
    '22222222-2222-2222-2222-222222222002',
    (CURRENT_DATE - INTERVAL '90 days')::date,
    2,
    1700.00,
    425.00,
    'completed',
    'fully_paid'
  ),
  -- Completed booking with review - for Fatima
  (
    '44444444-4444-4444-4444-444444444005',
    '33333333-3333-3333-3333-333333333005',
    '11111111-1111-1111-1111-111111111004',
    '22222222-2222-2222-2222-222222222003',
    (CURRENT_DATE - INTERVAL '45 days')::date,
    1,
    1100.00,
    330.00,
    'completed',
    'fully_paid'
  ),
  -- Disputed booking (for testing dispute flow)
  (
    '44444444-4444-4444-4444-444444444006',
    '33333333-3333-3333-3333-333333333002',
    '11111111-1111-1111-1111-111111111002',
    '22222222-2222-2222-2222-222222222001',
    (CURRENT_DATE - INTERVAL '20 days')::date,
    2,
    3900.00,
    1170.00,
    'disputed',
    'deposit_paid'
  ),
  -- Upcoming trip within ~2 days (triggers 24h rule testing)
  (
    '44444444-4444-4444-4444-444444444007',
    '33333333-3333-3333-3333-333333333004',
    '11111111-1111-1111-1111-111111111003',
    '22222222-2222-2222-2222-222222222002',
    (CURRENT_DATE + INTERVAL '2 days')::date,
    1,
    650.00,
    162.50,
    'confirmed',
    'deposit_paid'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED REVIEWS
-- ============================================================

INSERT INTO reviews (id, booking_id, trip_id, customer_id, guide_id, rating, comment) VALUES
  (
    '55555555-5555-5555-5555-555555555001',
    '44444444-4444-4444-4444-444444444004',
    '33333333-3333-3333-3333-333333333003',
    '11111111-1111-1111-1111-111111111003',
    '22222222-2222-2222-2222-222222222002',
    5,
    'Imran is simply the best trekking guide I have ever had. The Nanga Parbat trek was breathtaking — he knew every part of the route intimately and made sure our whole group was safe and comfortable throughout. His knowledge of local culture added so much depth to the experience.'
  ),
  (
    '55555555-5555-5555-5555-555555555002',
    '44444444-4444-4444-4444-444444444005',
    '33333333-3333-3333-3333-333333333005',
    '11111111-1111-1111-1111-111111111004',
    '22222222-2222-2222-2222-222222222003',
    5,
    'Fatima is an incredible guide and role model. This women-only expedition was beyond anything I imagined. She pushed us just the right amount and created a safe, empowering environment on the mountain. The pacing was perfect and her safety briefings were thorough without being frightening.'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DISPUTES
-- ============================================================

INSERT INTO disputes (id, booking_id, raised_by, issue_type, description, status) VALUES
  (
    '66666666-6666-6666-6666-666666666001',
    '44444444-4444-4444-4444-444444444006',
    '11111111-1111-1111-1111-111111111002',
    'trip_quality',
    'The trip did not match the description. We were told the route would include the full Baltoro Glacier crossing to Concordia but on day 4 we were turned back due to conditions the guide described as unsafe. I understand safety comes first, but there was no weather update provided beforehand and we feel the safety assessment should have been made before we departed. Requesting partial refund.',
    'under_review'
  )
ON CONFLICT DO NOTHING;

-- ============================================================
-- UPDATE GUIDE STATS (based on seeded reviews)
-- ============================================================

UPDATE guides SET
  rating = 4.7,
  total_reviews = 32,
  total_trips = 58
WHERE id = '22222222-2222-2222-2222-222222222002';

UPDATE guides SET
  rating = 4.8,
  total_reviews = 28,
  total_trips = 41
WHERE id = '22222222-2222-2222-2222-222222222003';

-- ============================================================
-- DONE
-- ============================================================
-- Demo accounts created:
--   Customers:
--     alex_hiker    / password123
--     sara_peaks    / password123
--     james_summit  / password123
--     priya_climbs  / password123
--   Guides:
--     hassan_guide  / password123  (K2 expert)
--     imran_peaks   / password123  (trekking expert)
--     fatima_guide  / password123  (women's expeditions)
-- ============================================================
