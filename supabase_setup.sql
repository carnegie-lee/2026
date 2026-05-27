-- ============================================================
--  Carnegie LEE Foundation — 콩쿠르 2026
--  Supabase SQL 설정 파일
--  Supabase 대시보드 → SQL Editor 에서 실행하세요
-- ============================================================

-- ① applications 테이블 (서류 신청)
CREATE TABLE IF NOT EXISTS applications (
  id                UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ref_number        TEXT        NOT NULL,
  form_type         TEXT        DEFAULT 'concours',
  submitted_at      TEXT,
  utm_campaign      TEXT,
  utm_medium        TEXT,
  utm_source        TEXT,
  db_type           TEXT,
  landed_at         TEXT,
  division          TEXT,
  division_etc      TEXT,
  instrument        TEXT,
  instrument_etc    TEXT,
  vocal_genre       TEXT,
  vocal_genre_etc   TEXT,
  name_ko           TEXT,
  birth             TEXT,
  gender            TEXT,
  phone             TEXT,
  email             TEXT,
  address_city      TEXT,
  address_district  TEXT,
  photo_data        TEXT,
  school_name       TEXT,
  career            TEXT,
  awards            TEXT,
  referral          TEXT,
  referral_etc      TEXT,
  marketing_consent TEXT        DEFAULT 'N',
  is_test           BOOLEAN     DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security — 본인 데이터만 접근
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_application"   ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_application" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ② video_submissions 테이블 (영상 제출)
CREATE TABLE IF NOT EXISTS video_submissions (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ref_number   TEXT,
  video_link   TEXT,
  composer     TEXT,
  piece        TEXT,
  submitted_at TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE video_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_video"   ON video_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_video" ON video_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ============================================================
--  관리자용 뷰 (대시보드에서 전체 데이터 조회용)
--  Supabase Table Editor 또는 SQL 에서 직접 조회 가능
-- ============================================================
-- SELECT * FROM applications ORDER BY created_at DESC;
-- SELECT * FROM video_submissions ORDER BY created_at DESC;
