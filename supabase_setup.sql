-- ============================================================
--  Carnegie LEE Foundation — 클래식 콩쿠르 2026
--  Supabase SQL 설정 파일
--
--  실행 방법:
--  Supabase 대시보드 → SQL Editor → New query → 전체 붙여넣기 → Run
--
--  ※ Supabase Auth 이메일 인증 비활성화 필수
--     Authentication → Providers → Email → Confirm email OFF
-- ============================================================

-- 기존 테이블 초기화 (재실행 시)
DROP TABLE IF EXISTS concours_video_submissions;
DROP TABLE IF EXISTS concours_applications;


-- ════════════════════════════════════════════
--  단일 통합 테이블 (서류 + 영상 한 row)
-- ════════════════════════════════════════════
CREATE TABLE concours_applications (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- 접수 메타
  ref_number       TEXT        NOT NULL,
  form_type        TEXT        DEFAULT 'concours',
  submitted_at     TEXT,
  is_test          BOOLEAN     DEFAULT FALSE,

  -- UTM
  utm_campaign     TEXT,
  utm_medium       TEXT,
  utm_source       TEXT,
  db_type          TEXT,
  landed_at        TEXT,

  -- 참가 부문
  division         TEXT,
  division_etc     TEXT,
  instrument       TEXT,
  instrument_etc   TEXT,
  vocal_genre      TEXT,
  vocal_genre_etc  TEXT,

  -- 참가자 정보
  name_ko          TEXT,
  birth            TEXT,
  gender           TEXT,
  phone            TEXT,
  email            TEXT,
  address_city     TEXT,
  address_district TEXT,
  photo_data       TEXT,

  -- 학력 · 경력
  school_name      TEXT,
  career           TEXT,
  awards           TEXT,

  -- 유입 경로
  referral         TEXT,
  referral_etc     TEXT,

  -- 약관
  marketing_consent TEXT DEFAULT 'N',

  -- 영상 제출 (서류 마감 후 UPDATE로 채워짐)
  video_link        TEXT,
  video_composer    TEXT,
  video_piece       TEXT,
  video_submitted_at TEXT,

  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE concours_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "app_select_own" ON concours_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "app_insert_own" ON concours_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "app_update_own" ON concours_applications
  FOR UPDATE USING (auth.uid() = user_id);


-- ════════════════════════════════════════════
--  관리자 조회 쿼리 예시
-- ════════════════════════════════════════════
-- 전체 신청자 (최신순)
-- SELECT ref_number, name_ko, email, phone, division, instrument,
--        submitted_at, video_link, video_submitted_at, is_test
-- FROM concours_applications
-- ORDER BY created_at DESC;

-- 서류만 제출하고 영상 미제출자
-- SELECT ref_number, name_ko, email, phone
-- FROM concours_applications
-- WHERE video_link IS NULL AND is_test = FALSE
-- ORDER BY created_at;

-- 영상까지 제출 완료자
-- SELECT ref_number, name_ko, email, video_link, video_composer, video_piece
-- FROM concours_applications
-- WHERE video_link IS NOT NULL AND is_test = FALSE
-- ORDER BY video_submitted_at;
