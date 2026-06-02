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
DROP TABLE IF EXISTS concours_video2_submissions;
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
  id_card_data     TEXT,

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

-- ※ 이미 운영 중인 DB라면(테이블 DROP 없이) 아래 한 줄만 실행해 컬럼을 추가하세요:
-- ALTER TABLE concours_applications ADD COLUMN IF NOT EXISTS id_card_data TEXT;


-- ════════════════════════════════════════════
--  신분증 사본 저장용 비공개 버킷 (id-cards)
--
--  1) Storage → New bucket → 이름 'id-cards' → Public 체크 해제(비공개) 생성
--  2) 아래 정책 실행
--     · 로그인 사용자는 본인 user_id로 시작하는 파일만 업로드/수정/조회 가능
--     · 조회(SELECT)는 본인 것만 → 서명 URL 생성에 필요
--     · 외부/타인 접근 불가, 관리자(service_role)만 전체 열람
-- ════════════════════════════════════════════
CREATE POLICY "idcard_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK ( bucket_id = 'id-cards' AND name LIKE auth.uid()::text || '%' );

CREATE POLICY "idcard_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING ( bucket_id = 'id-cards' AND name LIKE auth.uid()::text || '%' );

CREATE POLICY "idcard_select_own" ON storage.objects
  FOR SELECT TO authenticated
  USING ( bucket_id = 'id-cards' AND name LIKE auth.uid()::text || '%' );


-- ════════════════════════════════════════════
--  2차 영상 제출 테이블 (로그인 불필요, 본선 진출자용)
-- ════════════════════════════════════════════
CREATE TABLE concours_video2_submissions (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- 본인 확인
  ref_number       TEXT,
  name_ko          TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  phone            TEXT,

  -- 영상 정보
  video_link       TEXT        NOT NULL,
  video_composer   TEXT        NOT NULL,
  video_piece      TEXT        NOT NULL,

  submitted_at     TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE concours_video2_submissions ENABLE ROW LEVEL SECURITY;

-- 누구나 INSERT 가능 (로그인 불필요)
CREATE POLICY "video2_insert_anon" ON concours_video2_submissions
  FOR INSERT WITH CHECK (true);

-- 관리자만 SELECT (서비스 롤로만 조회)
-- 필요 시 아래 주석 해제:
-- CREATE POLICY "video2_select_admin" ON concours_video2_submissions
--   FOR SELECT USING (auth.role() = 'service_role');


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
