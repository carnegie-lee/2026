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


-- ════════════════════════════════════════════
--  1. 콩쿠르 서류 신청 테이블
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS concours_applications (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- 접수 메타
  ref_number       TEXT        NOT NULL,              -- CLF-2026-XXXXXX
  form_type        TEXT        DEFAULT 'concours',
  submitted_at     TEXT,                              -- 한국시각 문자열
  is_test          BOOLEAN     DEFAULT FALSE,

  -- UTM
  utm_campaign     TEXT,
  utm_medium       TEXT,
  utm_source       TEXT,
  db_type          TEXT,                              -- 유료DB / 무료DB
  landed_at        TEXT,

  -- 참가 부문
  division         TEXT,                              -- 기악 / 성악 / 기타
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
  photo_data       TEXT,                              -- base64 JPEG (300px, ~30KB)

  -- 학력 · 경력
  school_name      TEXT,
  career           TEXT,
  awards           TEXT,

  -- 유입 경로
  referral         TEXT,
  referral_etc     TEXT,

  -- 약관
  marketing_consent TEXT DEFAULT 'N',

  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE concours_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "concours_app_select_own" ON concours_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "concours_app_insert_own" ON concours_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ════════════════════════════════════════════
--  2. 영상 제출 테이블 (서류 마감 후 별도 제출)
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS concours_video_submissions (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  ref_number   TEXT,                                  -- 연계용 접수번호
  video_link   TEXT,                                  -- Google Drive / YouTube
  composer     TEXT,
  piece        TEXT,
  submitted_at TEXT,

  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE concours_video_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "concours_vid_select_own" ON concours_video_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "concours_vid_insert_own" ON concours_video_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ════════════════════════════════════════════
--  관리자 조회 쿼리 예시 (SQL Editor에서 직접 실행)
-- ════════════════════════════════════════════
-- 전체 신청자 목록 (최신순)
-- SELECT id, ref_number, name_ko, email, phone, division, instrument, submitted_at, is_test
-- FROM concours_applications
-- ORDER BY created_at DESC;

-- 영상 제출자 목록
-- SELECT v.ref_number, a.name_ko, a.email, v.video_link, v.composer, v.piece, v.submitted_at
-- FROM concours_video_submissions v
-- JOIN concours_applications a ON a.user_id = v.user_id
-- ORDER BY v.created_at DESC;

-- 서류 제출 / 영상 미제출자
-- SELECT a.ref_number, a.name_ko, a.email, a.phone
-- FROM concours_applications a
-- LEFT JOIN concours_video_submissions v ON v.user_id = a.user_id
-- WHERE v.id IS NULL AND a.is_test = FALSE
-- ORDER BY a.created_at;
