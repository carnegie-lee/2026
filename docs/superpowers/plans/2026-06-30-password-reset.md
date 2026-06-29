# 비밀번호 초기화(재설정) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 화면에서 비밀번호를 잊은 사용자가 이메일 링크로 새 비밀번호를 직접 설정하게 한다.

**Architecture:** Supabase Auth의 `resetPasswordForEmail` → 재설정 메일 → 신규 정적 페이지 `reset-password.html`에서 `updateUser({ password })`. 요청 링크는 index.html의 두 로그인 화면(모달·인라인)에 추가하고, 메일 redirect는 항상 루트의 단일 `reset-password.html`로 수렴시킨다.

**Tech Stack:** 정적 HTML/JS (GitHub Pages), supabase-js v2 (UMD CDN), 자동화 테스트 프레임워크 없음 → **검증은 수동(브라우저)**.

## Global Constraints

- 자동화 테스트 프레임워크 없음 → 각 태스크 검증은 로컬 정적 서버 + 브라우저 수동 확인. 이메일 왕복 검증은 실제 메일함 필요.
- 기존 코드 스타일 유지: `var`, 함수 선언, 한국어 하드코딩 메시지(영문/중문 분기 없음 — 링크 문구만 i18n).
- Supabase 클라이언트 전역 `sb`, SUPABASE_URL=`https://qldtlzqlsssfdmkxoirn.supabase.co`, anon 키는 `assets/concours.js` 58–59줄 값과 동일(공개용).
- `redirectTo`는 하드코딩 금지 — `new URL('reset-password.html', location.href).href`로 계산(UTM 쿼리 자동 제거).
- 성공 메시지는 가입 여부와 무관하게 항상 동일(계정 존재 노출 방지).
- **수동 선행 작업 (Task 2 end-to-end 검증 전 필요):** Supabase 대시보드 → Authentication → URL Configuration → Redirect URLs 에 `https://carnegie-lee.github.io/2026/concours/reset-password.html` (+ 로컬 테스트 시 `http://localhost:<port>/reset-password.html`) 등록. 미등록 시 메일 링크 redirect가 거부됨.

---

## File Structure

| 파일 | 책임 | 변경 |
|---|---|---|
| `index.html` | 두 로그인 화면에 "비밀번호를 잊으셨나요?" 링크 | 2곳 삽입 |
| `assets/i18n.js` | 링크 문구 en/zh 번역 | 2곳 삽입 |
| `assets/concours.js` | 재설정 요청 공유 헬퍼 + 링크 핸들러 2개 | 헬퍼 1개 + 와이어링 2개 |
| `reset-password.html` | 새 비밀번호 설정 페이지(복구 세션 감지 → updateUser) | 신규 |

---

### Task 1: 재설정 요청 측 (링크 + i18n + 핸들러)

**Files:**
- Modify: `assets/concours.js` (헬퍼 추가 ~301줄 뒤, 인라인 와이어링 ~526줄, 모달 와이어링 ~1082줄)
- Modify: `index.html` (인라인 박스 433줄 뒤, 모달 패널 1134줄 뒤)
- Modify: `assets/i18n.js` (zh 103줄 뒤, en 355줄 뒤)

**Interfaces:**
- Produces: `clfSendPwReset(emailId, errEl, linkEl)` — 전역 async 함수. `emailId`=이메일 input의 id 문자열, `errEl`=에러 표시 엘리먼트(또는 null), `linkEl`=클릭된 링크 `<a>`(성공 시 인라인 문구로 교체). 반환값 없음.

- [ ] **Step 1: i18n 키 추가 (zh)**

`assets/i18n.js`에서 `'auth.emailSentOk': '确认(前往登录)',` (103줄) 바로 다음 줄에 추가:

```javascript
      'auth.forgotPw': '忘记密码?',
```

- [ ] **Step 2: i18n 키 추가 (en)**

`assets/i18n.js`에서 `'auth.emailSentOk': 'OK (go to login)',` (355줄) 바로 다음 줄에 추가:

```javascript
      'auth.forgotPw': 'Forgot your password?',
```

- [ ] **Step 3: 인라인 로그인 박스(②)에 링크 추가**

`index.html`에서 아래 블록(433–434줄):

```html
            <button class="clf-auth-btn" id="clf-loginBtn" data-i18n="auth.loginBtn">로그인</button>
            <div class="clf-auth-switch"><span data-i18n="auth.noSubmit">아직 서류를 제출하지 않으셨나요?</span> <a id="clf-goRegister" data-i18n="auth.register">회원가입</a></div>
```

를 다음으로 교체(로그인 버튼 아래에 링크 한 줄 삽입, 기존 `clf-auth-switch` 스타일 재사용):

```html
            <button class="clf-auth-btn" id="clf-loginBtn" data-i18n="auth.loginBtn">로그인</button>
            <div class="clf-auth-switch" style="margin-top:8px;"><a id="clf-forgotPwLink" data-i18n="auth.forgotPw" style="cursor:pointer;">비밀번호를 잊으셨나요?</a></div>
            <div class="clf-auth-switch"><span data-i18n="auth.noSubmit">아직 서류를 제출하지 않으셨나요?</span> <a id="clf-goRegister" data-i18n="auth.register">회원가입</a></div>
```

- [ ] **Step 4: 모달 로그인 패널(①)에 링크 추가**

`index.html`에서 아래 블록(1134–1135줄):

```html
          <button class="clf-inst-submit" id="clf-instLoginBtn" type="button" data-i18n="modal.loginBtn">로그인 후 신청서 작성</button>
          <div class="clf-inst-divider"><span data-i18n="modal.noAccount">아직 계정이 없으신가요?</span></div>
```

를 다음으로 교체(로그인 버튼과 구분선 사이에 링크 삽입):

```html
          <button class="clf-inst-submit" id="clf-instLoginBtn" type="button" data-i18n="modal.loginBtn">로그인 후 신청서 작성</button>
          <div style="text-align:center; margin-top:10px;"><a id="clf-instForgotPwLink" data-i18n="auth.forgotPw" style="cursor:pointer; font-size:13px; color:#0C3D40; text-decoration:underline;">비밀번호를 잊으셨나요?</a></div>
          <div class="clf-inst-divider"><span data-i18n="modal.noAccount">아직 계정이 없으신가요?</span></div>
```

- [ ] **Step 5: 공유 헬퍼 `clfSendPwReset` 추가**

`assets/concours.js`에서 `clearInstErrors` 함수 닫는 `}` (301줄) 다음, 메인 IIFE `(async function () {` (306줄) 앞에 삽입:

```javascript
/* ══════════════════════════════════════════════
   비밀번호 재설정 메일 발송 (공유 헬퍼)
   ══════════════════════════════════════════════ */
async function clfSendPwReset(emailId, errEl, linkEl) {
  var fld = document.getElementById(emailId);
  var em  = ((fld && fld.value) || '').trim().toLowerCase();
  if (errEl) errEl.classList.remove('clf-show');
  if (!em) {
    if (errEl) { errEl.textContent = '이메일을 입력한 뒤 다시 눌러주세요.'; errEl.classList.add('clf-show'); }
    if (fld) fld.focus();
    return;
  }
  if (linkEl) { linkEl.style.pointerEvents = 'none'; linkEl.textContent = '메일 발송 중...'; }
  var redirectTo = new URL('reset-password.html', location.href).href;
  var { error } = await sb.auth.resetPasswordForEmail(em, { redirectTo: redirectTo });
  if (error) {
    if (errEl) { errEl.textContent = '메일 발송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'; errEl.classList.add('clf-show'); }
    if (linkEl) { linkEl.style.pointerEvents = ''; linkEl.textContent = '비밀번호를 잊으셨나요?'; }
    return;
  }
  clfGA('password_reset_request', { source: clfReferralLabel() });
  if (linkEl) {
    linkEl.removeAttribute('data-i18n');
    linkEl.textContent = '✓ 재설정 메일을 보냈습니다. 메일함(스팸함 포함)을 확인해 주세요.';
    linkEl.style.color = '#2E7D32';
    linkEl.style.cursor = 'default';
    linkEl.style.textDecoration = 'none';
    linkEl.style.pointerEvents = '';
  }
}
```

- [ ] **Step 6: 인라인 박스(②) 링크 와이어링**

`assets/concours.js`에서 인라인 로그인 keydown 블록(523–526줄) 다음, `var panelRegBtn = ...`(528줄) 앞에 삽입. 아래 블록:

```javascript
  ['clf-loginEmail', 'clf-loginPw'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && panelLoginBtn) panelLoginBtn.click(); });
  });

  var panelRegBtn = document.getElementById('clf-registerBtn');
```

를 다음으로 교체:

```javascript
  ['clf-loginEmail', 'clf-loginPw'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && panelLoginBtn) panelLoginBtn.click(); });
  });

  var forgotLink = document.getElementById('clf-forgotPwLink');
  if (forgotLink) forgotLink.addEventListener('click', function () {
    clfSendPwReset('clf-loginEmail', document.getElementById('clf-loginError'), forgotLink);
  });

  var panelRegBtn = document.getElementById('clf-registerBtn');
```

- [ ] **Step 7: 모달(①) 링크 와이어링**

`assets/concours.js`에서 모달 로그인 핸들러 종료부와 회원가입 주석 사이(1082–1084줄). 아래 블록:

```javascript
    await proceedToForm(data.user);
  });

  /* ── 모달 회원가입 ── */
```

를 다음으로 교체:

```javascript
    await proceedToForm(data.user);
  });

  var instForgotLink = document.getElementById('clf-instForgotPwLink');
  if (instForgotLink) instForgotLink.addEventListener('click', function () {
    clfSendPwReset('clf-instLoginEmail', document.getElementById('clf-instLoginErr'), instForgotLink);
  });

  /* ── 모달 회원가입 ── */
```

- [ ] **Step 8: 수동 검증 — 로컬 서버에서 링크 동작**

```bash
cd /mnt/c/Users/jdino/Desktop/Weekly/Concours-2026 && python3 -m http.server 8765
```

브라우저에서 `http://localhost:8765/index.html` 열고:
1. 신청 버튼 → 모달 로그인 탭에 "비밀번호를 잊으셨나요?" 링크 보임. 인라인 박스(마감 후 화면)에도 동일.
2. 이메일 칸 비우고 링크 클릭 → 이메일 칸 포커스 + "이메일을 입력한 뒤 다시 눌러주세요" 에러.
3. 임의 이메일 입력 후 클릭 → 링크가 "✓ 재설정 메일을 보냈습니다…" 초록 문구로 교체. DevTools Network 탭에 Supabase `…/auth/v1/recover` 요청 200 확인.
4. 콘솔 에러 없음.

기대: 위 1–4 모두 충족.

- [ ] **Step 9: 커밋**

```bash
git add index.html assets/i18n.js assets/concours.js
git commit -m "feat: add forgot-password request links to login screens"
```

---

### Task 2: 재설정 페이지 `reset-password.html`

**Files:**
- Create: `reset-password.html`

**Interfaces:**
- Consumes: Task 1의 메일이 보내는 redirect 대상(`reset-password.html`). 같은 Supabase 프로젝트(`sb`)를 페이지 내에서 재생성.

- [ ] **Step 1: `reset-password.html` 생성**

루트에 아래 내용으로 새 파일 생성:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>비밀번호 재설정 - Carnegie LEE Foundation</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .rp-card { background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); padding: 48px 40px; max-width: 440px; width: 100%; text-align: center; }
    .rp-title { font-size: 22px; font-weight: 700; color: #0C3D40; margin-bottom: 12px; }
    .rp-desc { font-size: 15px; color: #666; line-height: 1.6; margin-bottom: 24px; }
    .rp-field { text-align: left; margin-bottom: 14px; }
    .rp-label { display:block; font-size: 13px; font-weight: 600; color: #0C3D40; margin-bottom: 6px; }
    .rp-input { width: 100%; padding: 12px 14px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; }
    .rp-btn { width: 100%; padding: 14px; background: #0C3D40; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 6px; }
    .rp-btn:disabled { opacity: .6; cursor: default; }
    .rp-error { color: #B54E3A; font-size: 13px; font-weight: 600; margin-top: 12px; display: none; }
    .rp-link { display:inline-block; margin-top: 18px; font-size: 14px; color: #0C3D40; text-decoration: underline; }
    .rp-hidden { display: none; }
  </style>
</head>
<body>
  <div class="rp-card">
    <!-- 확인 중 -->
    <div id="rp-loading">
      <div class="rp-title">확인 중...</div>
      <div class="rp-desc">잠시만 기다려 주세요.</div>
    </div>

    <!-- 새 비밀번호 입력 -->
    <div id="rp-form" class="rp-hidden">
      <div class="rp-title">새 비밀번호 설정</div>
      <div class="rp-desc">새로 사용할 비밀번호를 입력해 주세요.</div>
      <div class="rp-field">
        <label class="rp-label" for="rp-pw1">새 비밀번호</label>
        <input class="rp-input" type="password" id="rp-pw1" placeholder="6자 이상" autocomplete="new-password">
      </div>
      <div class="rp-field">
        <label class="rp-label" for="rp-pw2">새 비밀번호 확인</label>
        <input class="rp-input" type="password" id="rp-pw2" placeholder="비밀번호 재입력" autocomplete="new-password">
      </div>
      <button class="rp-btn" id="rp-submit" type="button">비밀번호 변경</button>
      <div class="rp-error" id="rp-error"></div>
    </div>

    <!-- 무효/만료 -->
    <div id="rp-invalid" class="rp-hidden">
      <div class="rp-title">링크가 유효하지 않습니다</div>
      <div class="rp-desc">재설정 링크가 유효하지 않거나 만료되었습니다.<br>로그인 화면에서 다시 요청해 주세요.</div>
      <a class="rp-link" href="index.html">로그인 화면으로</a>
    </div>

    <!-- 완료 -->
    <div id="rp-done" class="rp-hidden">
      <div class="rp-title">비밀번호가 변경되었습니다</div>
      <div class="rp-desc">새 비밀번호로 다시 로그인해 주세요.</div>
      <a class="rp-link" href="index.html">로그인하러 가기</a>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script>
    var SUPABASE_URL = 'https://qldtlzqlsssfdmkxoirn.supabase.co';
    var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZHRsenFsc3NzZmRta3hvaXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTk1MTYsImV4cCI6MjA5NTE5NTUxNn0.3uBMsRnrnwPH9Nn-6pDTnXjzLjmPA7K3mkNic0iynLE';
    var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    function show(id) {
      ['rp-loading', 'rp-form', 'rp-invalid', 'rp-done'].forEach(function (x) {
        document.getElementById(x).classList.toggle('rp-hidden', x !== id);
      });
    }

    var resolved = false;
    function resolveState(ok) {
      if (resolved) return;
      resolved = true;
      show(ok ? 'rp-form' : 'rp-invalid');
    }

    /* 복구 링크로 진입하면 supabase가 URL 토큰을 파싱해 임시 세션 생성 후 이벤트 발생 */
    sb.auth.onAuthStateChange(function (event, session) {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) resolveState(true);
    });

    (async function () {
      var res = await sb.auth.getSession();
      if (res.data && res.data.session) { resolveState(true); return; }
      /* onAuthStateChange가 늦게 올 수 있어 한 번 더 확인 후 무효 처리 */
      setTimeout(function () {
        sb.auth.getSession().then(function (r) {
          resolveState(!!(r.data && r.data.session));
        });
      }, 1500);
    })();

    document.getElementById('rp-submit').addEventListener('click', async function () {
      var pw1 = (document.getElementById('rp-pw1').value || '').trim();
      var pw2 = (document.getElementById('rp-pw2').value || '').trim();
      var err = document.getElementById('rp-error');
      err.style.display = 'none';
      if (pw1.length < 6) { err.textContent = '비밀번호는 6자 이상이어야 합니다.'; err.style.display = 'block'; return; }
      if (pw1 !== pw2)    { err.textContent = '비밀번호가 일치하지 않습니다.';      err.style.display = 'block'; return; }
      var btn = this;
      btn.disabled = true; btn.textContent = '변경 중...';
      var upd = await sb.auth.updateUser({ password: pw1 });
      btn.disabled = false; btn.textContent = '비밀번호 변경';
      if (upd.error) { err.textContent = '비밀번호 변경에 실패했습니다. 링크가 만료되었을 수 있습니다.'; err.style.display = 'block'; return; }
      show('rp-done');
    });
  </script>
</body>
</html>
```

- [ ] **Step 2: 수동 검증 — 토큰 없이 접근 시 무효 처리**

로컬 서버 실행 중인 상태에서 `http://localhost:8765/reset-password.html` 직접 접근(복구 토큰 없음):

기대: 잠깐 "확인 중..." 후 "링크가 유효하지 않습니다" 화면 + "로그인 화면으로" 링크. 콘솔 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add reset-password.html
git commit -m "feat: add password reset page"
```

- [ ] **Step 4: End-to-end 검증 (수동 선행 작업 완료 후)**

선행: Supabase 대시보드 Redirect URLs에 재설정 페이지 URL 등록(Global Constraints 참조).

프로덕션(또는 등록한 로컬 URL)에서:
1. 로그인 화면 → 가입된 본인 이메일 입력 → "비밀번호를 잊으셨나요?" 클릭 → 메일 수신.
2. 메일의 링크 클릭 → `reset-password.html`에 "새 비밀번호 설정" 폼 표시.
3. 6자 미만/불일치 입력 → 검증 에러. 정상 입력 → "비밀번호가 변경되었습니다".
4. 새 비밀번호로 로그인 성공.

기대: 1–4 모두 충족. (PKCE `?code=` 흐름으로 도착해 폼이 안 뜨면 reset-password.html에 `exchangeCodeForSession(location.href)` 처리 추가 — Step 1 스크립트의 `getSession` 폴백 직전에 삽입.)

---

## Self-Review

**1. Spec coverage:**
- 4.1 요청 측 링크/핸들러 → Task 1 (Step 3–7) ✓
- 4.2 재설정 페이지/상태/검증 → Task 2 (Step 1) ✓
- 4.3 Supabase 대시보드 수동 설정 → Global Constraints + Task 2 Step 4 ✓
- 4.4 i18n(en/zh) → Task 1 (Step 1–2) ✓
- 5. 변경 파일 4종 → 모두 태스크에 포함 ✓
- 6. 검증 기준 1–7 → Task 1 Step 8, Task 2 Step 2·4에 대응 ✓

**2. Placeholder scan:** TBD/TODO/추상 표현 없음. 모든 코드 단계에 실제 코드 포함.

**3. Type consistency:** `clfSendPwReset(emailId, errEl, linkEl)` 시그니처가 Step 5 정의와 Step 6·7 호출에서 일치. 엘리먼트 id(`clf-forgotPwLink`/`clf-instForgotPwLink`, `clf-loginError`/`clf-instLoginErr`, `clf-loginEmail`/`clf-instLoginEmail`)가 HTML 삽입(Step 3·4)과 와이어링(Step 6·7)에서 일치. reset 페이지 상태 id(`rp-loading`/`rp-form`/`rp-invalid`/`rp-done`)가 `show()` 목록과 일치.
