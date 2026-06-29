# 비밀번호 초기화(재설정) 기능 — 설계 문서

작성일: 2026-06-30

## 1. 목표

로그인 화면에서 비밀번호를 잊은 사용자가 **이메일로 받은 링크를 통해 새 비밀번호를 직접 설정**할 수 있게 한다. Supabase Auth의 기본 비밀번호 재설정 메일 흐름을 사용한다.

현재는 비밀번호 초기화/찾기 기능이 코드에 전혀 없다.

## 2. 배경 (현재 구조)

- 인증: Supabase Auth, anon 클라이언트 (`sb`). URL/anon 키는 [`assets/concours.js`](../../../assets/concours.js) 58–60줄에 하드코딩(공개용 anon 키이므로 정상).
- 로그인 진입점이 두 곳이며 **둘 다 같은 Supabase 프로젝트·같은 계정**:
  - **① 팝업 모달**(내부명 "기관형", `clf-inst-*`): 신청 버튼/모집요강 미리보기 클릭 시 노출. [`index.html`](../../../index.html) 1100줄~, 핸들러 [`assets/concours.js`](../../../assets/concours.js) 1054줄~.
  - **② 인라인 로그인 박스**: 접수 마감 이후 로그인. [`index.html`](../../../index.html) 421줄~, 핸들러 [`assets/concours.js`](../../../assets/concours.js) 503줄~.
- 기존 이메일 인증 리디렉트 페이지 [`confirm.html`](../../../confirm.html)은 JS 없는 정적 페이지. 재설정 페이지는 이와 달리 **JS로 복구 세션을 받아 새 비밀번호를 설정**해야 한다.
- i18n: `assets/i18n.js`의 `DICT = { zh:{...}, en:{...} }`. **한국어가 기본**(HTML 리터럴), 비한국어만 사전에서 조회. JS 내부 에러 메시지는 기존에도 한국어 하드코딩.
- 배포: GitHub Pages, 사이트 경로 `https://carnegie-lee.github.io/2026/concours/`. UTM 태그가 붙은 여러 진입 링크가 존재.

## 3. 범위

### 포함
- 로그인 화면 ①②에 "비밀번호를 잊으셨나요?" 링크 추가 및 재설정 메일 발송 처리
- 새 비밀번호 설정 페이지 `reset-password.html` (루트, 1개)
- 링크 문구 i18n(ko/en/zh)
- Supabase 대시보드 수동 설정 안내(문서)

### 제외 (YAGNI)
- **영상제출 페이지(`video/index.html`) 로그인** — 해당 페이지는 더 이상 사용하지 않기로 하여 제외
- 보안 질문, SMS/문자 인증, 자체 토큰 관리 — Supabase 기본 메일 흐름으로 충분
- 재설정 페이지 다국어 — `confirm.html`과 동일하게 한국어 정적 페이지로 통일

## 4. 설계

### 4.1 요청 측 — "비밀번호를 잊으셨나요?" 링크 (index.html ①②)

각 로그인 폼의 로그인 버튼 아래에 링크를 추가한다.

- **① 모달 로그인 패널**(`clf-instLoginPanel`): 이메일 필드 `clf-instLoginEmail`, 에러 영역 `clf-instLoginErr`
- **② 인라인 로그인 박스**(`clf-loginBox`): 이메일 필드 `clf-loginEmail`, 에러 영역 `clf-loginError`

**동작** (두 곳 공통 로직, 공유 헬퍼 1개로 구현):
1. 해당 폼에 **이미 입력된 이메일**을 읽는다.
2. 이메일이 비어 있으면 → 이메일 칸 포커스 + 안내 문구("이메일을 입력한 뒤 다시 눌러주세요").
3. `sb.auth.resetPasswordForEmail(email, { redirectTo })` 호출.
   - `redirectTo = new URL('reset-password.html', location.href).href`
   - ①②는 같은 루트 페이지이므로 단순 상대경로로 항상 `…/2026/concours/reset-password.html`로 수렴. **UTM 쿼리스트링은 `new URL()` 해석 시 자동 제거**되어 redirect에 영향 없음.
4. 성공 시 → **링크를 같은 위치에서 인라인 확인 문구로 교체**: "재설정 메일을 보냈습니다. 메일함(스팸함 포함)을 확인해 주세요." **별도 페이지/모달 전환 없음.**
   - 보안상 **가입 여부와 무관하게 항상 동일한 성공 문구**를 보여준다(계정 존재 여부 노출 방지).
5. 호출 실패(네트워크 등) 시에만 일반 오류 문구 노출.

> JS 메시지는 기존 코드와 동일하게 한국어 하드코딩으로 처리(영문/중문 분기 없음 — 기존 로그인 에러 메시지도 한국어 하드코딩).

### 4.2 재설정 페이지 — `reset-password.html` (신규, 루트)

`confirm.html`과 같은 카드 톤의 정적 페이지에 supabase-js를 로드한다.

- 스크립트: `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js` + 같은 SUPABASE_URL/anon 키로 클라이언트 생성.
- **복구 세션 감지**: supabase-js 기본 `detectSessionInUrl: true`가 메일 링크의 복구 토큰을 파싱하여 임시 세션을 만든다. `sb.auth.onAuthStateChange`의 `PASSWORD_RECOVERY` 이벤트로 폼을 노출한다.
- **화면 상태**:
  1. **확인 중**: 진입 직후 짧은 로딩.
  2. **유효한 복구 세션**: 새 비밀번호 + 비밀번호 확인 입력 폼 표시.
  3. **링크 무효/만료**(복구 세션 없음): "재설정 링크가 유효하지 않거나 만료되었습니다. 다시 요청해 주세요." + 로그인 화면(`index.html`) 링크.
  4. **변경 완료**: "비밀번호가 변경되었습니다." + "로그인하러 가기"(`index.html`) 링크.
- **검증**(회원가입과 동일): 새 비밀번호 6자 이상, 두 입력 일치.
- **제출**: `sb.auth.updateUser({ password: newPw })` → 성공 시 상태 4로, 실패 시 오류 문구.

> 구현/테스트 시 확인할 점: Supabase 프로젝트가 implicit(해시 토큰) 흐름이면 `detectSessionInUrl`만으로 동작. 만약 PKCE(`?code=`) 흐름이면 `exchangeCodeForSession` 처리가 추가로 필요할 수 있음 — 실제 발송 메일 링크로 검증한다.

### 4.3 Supabase 대시보드 수동 설정 (코드 불가 — 사용자 작업)

1. **Authentication → URL Configuration → Redirect URLs** 에 다음 추가:
   - `https://carnegie-lee.github.io/2026/concours/reset-password.html`
   - (로컬 테스트 시) 사용 중인 `http://localhost:<port>/reset-password.html`
   - 미등록 시 메일 링크의 redirect가 거부됨. **UTM 무관하게 이 1개만 등록하면 됨.**
2. (선택) **Authentication → Email Templates → Reset Password** 템플릿을 한국어로 다듬기. 기본 템플릿으로도 동작.

### 4.4 i18n

- 링크 문구용 키 1개 추가(①② 공용): 한국어는 HTML 리터럴, `assets/i18n.js`의 `zh`/`en`에 추가.
  - ko(리터럴): `비밀번호를 잊으셨나요?`
  - en: `Forgot your password?`
  - zh: `忘记密码?`
- `reset-password.html`은 한국어 정적 페이지(다국어 미적용).

## 5. 변경 파일

| 파일 | 변경 |
|---|---|
| `index.html` | ①모달·②인라인 로그인에 "비밀번호를 잊으셨나요?" 링크 추가 |
| `assets/concours.js` | 재설정 요청 공유 헬퍼 + ①② 링크 이벤트 핸들러 |
| `assets/i18n.js` | 링크 문구 `en`/`zh` 키 추가 |
| `reset-password.html` | 신규 — 새 비밀번호 설정 페이지 |
| (수동) Supabase 대시보드 | Redirect URLs 등록, (선택) 메일 템플릿 한글화 |

## 6. 검증 (성공 기준)

1. ① 모달에서 가입된 이메일 입력 후 "비밀번호를 잊으셨나요?" 클릭 → 인라인 확인 문구 노출, 재설정 메일 수신.
2. ② 인라인 박스에서도 동일하게 동작.
3. 이메일 미입력 상태로 클릭 → 이메일 칸 포커스 + 안내 문구(메일 발송 안 됨).
4. 메일의 링크 클릭 → `reset-password.html`에서 새 비밀번호 폼 표시.
5. 6자 미만/불일치 → 검증 오류. 정상 입력 → "비밀번호가 변경되었습니다" → 새 비밀번호로 로그인 성공.
6. 만료/위조 링크로 접근 → 무효 안내 + 로그인 링크.
7. UTM 파라미터가 붙은 진입(예: `index.html?utm_source=조수미`)에서 요청해도 redirect가 동일한 `reset-password.html`로 정상 동작.
