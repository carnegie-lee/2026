/* ── UTM 및 랜딩 정보 저장 ── */
(function saveLandingInfo() {
  var params = new URLSearchParams(window.location.search);
  if (params.get('utm_campaign') || params.get('utm_source')) {
    sessionStorage.setItem('utm_campaign', params.get('utm_campaign') || 'concours');
    sessionStorage.setItem('utm_medium',   params.get('utm_medium')   || 'free');
    sessionStorage.setItem('utm_source',   params.get('utm_source')   || 'site');
    sessionStorage.setItem('landedAt',     new Date().toISOString());
  }
})();

/* ══════════════════════════════════════════════
   Supabase 초기화
   ══════════════════════════════════════════════ */
var SUPABASE_URL = 'https://qldtlzqlsssfdmkxoirn.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZHRsenFsc3NzZmRta3hvaXJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MTk1MTYsImV4cCI6MjA5NTE5NTUxNn0.3uBMsRnrnwPH9Nn-6pDTnXjzLjmPA7K3mkNic0iynLE';
var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ══════════════════════════════════════════════
   날짜 상수
   ══════════════════════════════════════════════ */
var DOC_DEADLINE = new Date('2026-06-08T16:00:00+09:00');
var VID_OPEN     = new Date('2026-06-08T16:02:00+09:00');
var VID_DEADLINE = new Date('2026-06-26T18:00:00+09:00');

/* ══════════════════════════════════════════════
   테스트 계정
   ══════════════════════════════════════════════ */
var TEST_ACCOUNTS = ['dajung8474@naver.com'];
function isTestAccount(email) {
  return email ? TEST_ACCOUNTS.indexOf((email + '').toLowerCase().trim()) !== -1 : false;
}

/* ══════════════════════════════════════════════
   Supabase DB 헬퍼
   ══════════════════════════════════════════════ */
async function getApplication(userId) {
  var { data } = await sb.from('concours_applications').select('*').eq('user_id', userId).maybeSingle();
  return data;
}
async function saveApplication(userId, payload) {
  return sb.from('concours_applications').upsert(
    Object.assign({ user_id: userId }, payload),
    { onConflict: 'user_id' }
  );
}
async function saveVideoSubmission(userId, payload) {
  return sb.from('concours_applications').update({
    video_link:        payload.video_link,
    video_composer:    payload.composer,
    video_piece:       payload.piece,
    video_submitted_at: payload.submitted_at,
    updated_at:        new Date().toISOString()
  }).eq('user_id', userId);
}

/* ══════════════════════════════════════════════
   DB 컬럼(snake_case) → 폼 필드명(camelCase) 변환
   ══════════════════════════════════════════════ */
function dbToFormFields(d) {
  if (!d) return {};
  return {
    division: d.division, divisionEtc: d.division_etc,
    instrument: d.instrument, instrumentEtc: d.instrument_etc,
    vocalGenre: d.vocal_genre, vocalGenreEtc: d.vocal_genre_etc,
    nameKo: d.name_ko, birth: d.birth, gender: d.gender,
    phone: d.phone, email: d.email,
    addressCity: d.address_city, addressDistrict: d.address_district,
    schoolName: d.school_name, career: d.career,
    awards: d.awards, referral: d.referral, referralEtc: d.referral_etc,
    marketingConsent: d.marketing_consent,
  };
}

/* ══════════════════════════════════════════════
   Base64 Data URL → Blob 변환 헬퍼 (Storage 업로드용)
   ══════════════════════════════════════════════ */
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

/* ══════════════════════════════════════════════
   주소 데이터
   ══════════════════════════════════════════════ */
var KOREA_ADDRESS = {
  "서울특별시": ["강남구","강동구","강북구","강서구","관악구","광진구","구로구","금천구","노원구","도봉구","동대문구","동작구","마포구","서대문구","서초구","성동구","성북구","송파구","양천구","영등포구","용산구","은평구","종로구","중구","중랑구"],
  "부산광역시": ["강서구","금정구","기장군","남구","동구","동래구","부산진구","북구","사상구","사하구","서구","수영구","연제구","영도구","중구","해운대구"],
  "대구광역시": ["군위군","남구","달서구","달성군","동구","북구","서구","수성구","중구"],
  "인천광역시": ["강화군","계양구","남동구","동구","미추홀구","부평구","서구","연수구","옹진군","중구"],
  "광주광역시": ["광산구","남구","동구","북구","서구"],
  "대전광역시": ["대덕구","동구","서구","유성구","중구"],
  "울산광역시": ["남구","동구","북구","울주군","중구"],
  "세종특별자치시": ["세종특별자치시"],
  "경기도": ["가평군","고양시","과천시","광명시","광주시","구리시","군포시","김포시","남양주시","동두천시","부천시","성남시","수원시","시흥시","안산시","안성시","안양시","양주시","양평군","여주시","연천군","오산시","용인시","의왕시","의정부시","이천시","파주시","평택시","포천시","하남시","화성시"],
  "강원특별자치도": ["강릉시","고성군","동해시","삼척시","속초시","양구군","양양군","영월군","원주시","인제군","정선군","철원군","춘천시","태백시","평창군","홍천군","화천군","횡성군"],
  "충청북도": ["괴산군","단양군","보은군","영동군","옥천군","음성군","제천시","증평군","진천군","청주시","충주시"],
  "충청남도": ["계룡시","공주시","금산군","논산시","당진시","보령시","부여군","서산시","서천군","아산시","예산군","천안시","청양군","태안군","홍성군"],
  "전북특별자치도": ["고창군","군산시","김제시","남원시","무주군","부안군","순창군","완주군","익산시","임실군","장수군","전주시","정읍시","진안군"],
  "전라남도": ["강진군","고흥군","곡성군","광양시","구례군","나주시","담양군","목포시","무안군","보성군","순천시","신안군","여수시","영광군","영암군","완도군","장성군","장흥군","진도군","함평군","해남군","화순군"],
  "경상북도": ["경산시","경주시","고령군","구미시","김천시","문경시","봉화군","상주시","성주군","안동시","영덕군","영양군","영주시","영천시","예천군","울릉군","울진군","의성군","청도군","청송군","칠곡군","포항시"],
  "경상남도": ["거제시","거창군","고성군","김해시","남해군","밀양시","사천시","산청군","양산시","의령군","진주시","창녕군","창원시","통영시","하동군","함안군","함양군","합천군"],
  "제주특별자치도": ["서귀포시","제주시"],
  "해외": ["해외"]
};

/* ── 주소 드롭다운 초기화 ── */
function initAddressDropdowns() {
  var citySelect = document.getElementById('addressCity');
  var distSelect = document.getElementById('addressDistrict');
  if (!citySelect || !distSelect) return;
  Object.keys(KOREA_ADDRESS).forEach(function (city) {
    var opt = document.createElement('option');
    opt.value = city; opt.textContent = city;
    citySelect.appendChild(opt);
  });
  citySelect.addEventListener('change', function () {
    distSelect.innerHTML = '<option value="">— 구·군 선택 —</option>';
    (KOREA_ADDRESS[this.value] || []).forEach(function (dist) {
      var opt = document.createElement('option');
      opt.value = dist; opt.textContent = dist;
      distSelect.appendChild(opt);
    });
  });
}

/* ══════════════════════════════════════════════
   폼 복원 (제출한 데이터로 채우기)
   ══════════════════════════════════════════════ */
function fillFormFromData(formData) {
  var form = document.getElementById('clf-applyForm');
  if (!form || !formData) return;

  Object.keys(formData).forEach(function (key) {
    form.querySelectorAll('[name="' + key + '"]').forEach(function (el) {
      var t = (el.type || '').toLowerCase();
      if (t === 'radio')      { el.checked = el.value === formData[key]; }
      else if (t === 'checkbox') { el.checked = formData[key] === 'Y' || formData[key] === true; }
      else if (t !== 'file') { el.value = formData[key] != null ? formData[key] : ''; }
    });
  });

  /* 분야 UI 토글 복원 */
  var dv   = formData.division || '';
  var inst = document.getElementById('instrumentBox');
  var voc  = document.getElementById('vocalBox');
  var etc  = document.getElementById('divisionEtcBox');
  if (inst) inst.style.setProperty('display', dv === '기악' ? 'grid' : 'none', 'important');
  if (voc)  voc.style.setProperty('display',  dv === '성악' ? 'grid' : 'none', 'important');
  if (etc && dv === '기타') etc.classList.add('clf-show');

  /* 기타 옵션 박스 복원 */
  form.querySelectorAll('.clf-with-etc').forEach(function (sel) {
    if (sel.value === '기타') {
      var box = document.getElementById(sel.getAttribute('data-etc'));
      if (box) box.classList.add('clf-show');
    }
  });

  /* 주소 드롭다운 복원 */
  var cs = document.getElementById('addressCity');
  var ds = document.getElementById('addressDistrict');
  if (cs && formData.addressCity) {
    cs.value = formData.addressCity;
    cs.dispatchEvent(new Event('change'));
    if (ds && formData.addressDistrict) ds.value = formData.addressDistrict;
  }
}

/* ── 폼 잠금 처리 ── */
function lockApplyForm() {
  var form = document.getElementById('clf-applyForm');
  if (!form || form.classList.contains('clf-form-locked')) return;
  if (!form.querySelector('.clf-locked-banner')) {
    var banner = document.createElement('div');
    banner.className = 'clf-locked-banner';
    banner.innerHTML = '✓ <b>제출 완료</b> · 아래는 제출하신 내용입니다. 더 이상 수정할 수 없으며, 변경이 필요하시면 <a href="tel:1588-8418" style="color:#fff;font-weight:700;text-decoration:underline;">1588-8418</a>로 문의해 주세요.';
    form.insertBefore(banner, form.firstChild);
  }
  form.classList.add('clf-form-locked');
  form.querySelectorAll('input, select, textarea, button').forEach(function (el) { el.disabled = true; });
}

/* ══════════════════════════════════════════════
   기관형 인증 모달
   ══════════════════════════════════════════════ */
function openAuthModal() {
  var bd = document.getElementById('clf-instModalBd');
  if (!bd) return;
  showInstTab('login');
  clearInstErrors();
  bd.classList.add('clf-show');
  document.body.style.overflow = 'hidden';
  setTimeout(function () {
    var el = document.getElementById('clf-instLoginEmail');
    if (el) el.focus();
  }, 120);
}
function closeAuthModal() {
  var bd = document.getElementById('clf-instModalBd');
  if (bd) bd.classList.remove('clf-show');
  document.body.style.overflow = '';
}
function showInstTab(tab) {
  var lp = document.getElementById('clf-instLoginPanel');
  var rp = document.getElementById('clf-instRegPanel');
  var lt = document.getElementById('clf-instTabLogin');
  var rt = document.getElementById('clf-instTabReg');
  if (tab === 'login') {
    if (lp) lp.style.display = '';
    if (rp) rp.style.display = 'none';
    if (lt) lt.classList.add('clf-inst-active');
    if (rt) rt.classList.remove('clf-inst-active');
    setTimeout(function () { var e = document.getElementById('clf-instLoginEmail'); if (e) e.focus(); }, 80);
  } else {
    if (rp) rp.style.display = '';
    if (lp) lp.style.display = 'none';
    if (rt) rt.classList.add('clf-inst-active');
    if (lt) lt.classList.remove('clf-inst-active');
    setTimeout(function () { var e = document.getElementById('clf-instRegEmail'); if (e) e.focus(); }, 80);
  }
}
function clearInstErrors() {
  ['clf-instLoginErr', 'clf-instRegErr'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.remove('clf-show'); }
  });
}

/* ══════════════════════════════════════════════
   메인 초기화 (async IIFE)
   ══════════════════════════════════════════════ */
(async function () {
  var now     = new Date();
  var docOpen = now < DOC_DEADLINE;

  var openBtn      = document.getElementById('clf-applyOpenBtn');
  var closedBanner = document.getElementById('clf-closedBanner');
  var ddayTimers   = document.querySelectorAll('.clf-dday-timer-wrap');
  var ddayTexts    = document.querySelectorAll('.clf-dday-time');
  var authPanel    = document.getElementById('clf-authPanel');
  var myPage       = document.getElementById('clf-myPage');

  /* 주소 드롭다운 초기화 */
  initAddressDropdowns();

  /* 스크롤 인 애니메이션 */
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('dir-visible'); });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('[data-dir-anim]').forEach(function (el) { obs.observe(el); });

  /* D-day 타이머 */
  function updateDocTimer() {
    var diff = DOC_DEADLINE - new Date();
    if (diff <= 0) {
      if (openBtn) openBtn.style.setProperty('display', 'none', 'important');
      ddayTimers.forEach(function (el) { el.style.setProperty('display', 'none', 'important'); });
      return false;
    }
    ddayTimers.forEach(function (el) { el.style.setProperty('display', 'inline-flex', 'important'); });
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff / 3600000) % 24);
    var m = Math.floor((diff / 60000) % 60);
    var s = Math.floor((diff / 1000) % 60);
    var txt = (d > 0 ? d + '일 ' : '') +
      String(h).padStart(2, '0') + '시간 ' +
      String(m).padStart(2, '0') + '분 ' +
      String(s).padStart(2, '0') + '초';
    ddayTexts.forEach(function (el) { el.textContent = txt; });
    return true;
  }

  /* 현재 Supabase 세션 확인 */
  var { data: { session } } = await sb.auth.getSession();

  /* ════════════════════
     서류 접수 기간 중
     ════════════════════ */
  if (docOpen) {
    if (closedBanner) closedBanner.style.setProperty('display', 'none', 'important');
    if (openBtn)      openBtn.style.setProperty('display', 'inline-flex', 'important');
    if (updateDocTimer()) setInterval(updateDocTimer, 1000);

    if (openBtn) openBtn.addEventListener('click', openAuthModal);

    /* 이미 로그인된 경우 계정 이메일 자동 입력 */
    if (session) {
      var ae = document.getElementById('clf-acctEmail');
      if (ae && !ae.value) ae.value = session.user.email;
    }

    /* 이미 제출한 경우 폼 복원 + 잠금 */
    await applyLockedStateIfSubmitted(session);

  } else {
    /* ════════════════════
       서류 마감 이후
       ════════════════════ */
    if (openBtn) openBtn.style.setProperty('display', 'none', 'important');
    ddayTimers.forEach(function (el) { el.style.setProperty('display', 'none', 'important'); });
    if (closedBanner) closedBanner.style.setProperty('display', 'block', 'important');

    if (session) {
      await showMyPage(session.user);
    } else {
      if (authPanel) authPanel.style.setProperty('display', 'block', 'important');
    }
  }

  /* ════════════════════
     마이페이지 렌더
     ════════════════════ */
  async function showMyPage(user) {
    if (authPanel) authPanel.style.setProperty('display', 'none', 'important');
    if (myPage)    myPage.style.setProperty('display', 'block', 'important');

    var appData = await getApplication(user.id);

    var nameEl = document.getElementById('clf-myPageName');
    if (nameEl) nameEl.textContent = ((appData && appData.name_ko) ? appData.name_ko : user.email) + ' 님, 안녕하세요 👋';

    renderSubmission(appData);
    renderVideoSection(user, appData);
  }

  function renderSubmission(data) {
    var el = document.getElementById('clf-mySubmission');
    if (!el) return;
    if (!data || !data.name_ko) {
      el.innerHTML = '<div class="clf-callout"><div class="clf-callout-icon">ℹ</div><div>제출된 서류 내용이 없습니다.</div></div>';
      return;
    }
    var rows = [
      ['접수번호',       data.ref_number],
      ['접수일시',       data.submitted_at],
      ['경연 분야',      data.division],
      ['세부 악기/장르', data.instrument || data.vocal_genre || data.division_etc],
      ['성명',           data.name_ko],
      ['생년월일',       data.birth],
      ['성별',           data.gender],
      ['휴대전화',       data.phone],
      ['이메일',         data.email],
      ['학교명·전공',    data.school_name],
      ['활동 경력',      data.career],
      ['수상 내역',      data.awards],
      ['유입 경로',      data.referral],
    ];
    var html = '<div class="clf-submitted-card"><div class="clf-submitted-card-header">' +
      '<div class="clf-submitted-card-title">📄 제출한 서류 내용</div>' +
      '<div class="clf-submitted-badge">✓ 서류 접수 완료</div></div>';
    rows.forEach(function (r) {
      html += '<div class="clf-submitted-row"><div class="clf-submitted-key">' + r[0] +
        '</div><div class="clf-submitted-val">' + (r[1] || '—').replace(/\n/g, '<br>') + '</div></div>';
    });
    el.innerHTML = html + '</div>';
  }

  function renderVideoSection(user, appData) {
    var lockEl = document.getElementById('clf-videoLocked');
    var openEl = document.getElementById('clf-videoOpen');
    var formEl = document.getElementById('clf-videoForm');
    var doneEl = document.getElementById('clf-videoAlreadySubmitted');
    var now2   = new Date();
    var inPeriod = now2 >= VID_OPEN && now2 < VID_DEADLINE;

    if (!appData || !appData.name_ko) {
      if (lockEl) {
        lockEl.style.setProperty('display', 'block', 'important');
        document.getElementById('clf-vl-title').textContent = '서류를 제출하지 않으셨습니다';
        document.getElementById('clf-vl-desc').textContent  = '영상 제출은 서류를 제출한 참가자만 가능합니다.';
        document.getElementById('clf-vl-date').textContent  = '';
      }
      if (openEl) openEl.style.setProperty('display', 'none', 'important');
      return;
    }

    if (!inPeriod) {
      if (lockEl) {
        lockEl.style.setProperty('display', 'block', 'important');
        if (now2 < VID_OPEN) {
          document.getElementById('clf-vl-title').textContent = '영상 제출 기간이 아닙니다';
          document.getElementById('clf-vl-desc').textContent  = '서류 접수 마감(6월 5일 18:00) 이후 영상 제출이 열립니다.';
          document.getElementById('clf-vl-date').textContent  = '2026년 6월 5일 18:00 이후 열림';
        } else {
          document.getElementById('clf-vl-title').textContent = '영상 제출이 마감되었습니다';
          document.getElementById('clf-vl-desc').textContent  = '영상 제출 마감: 2026년 6월 26일 18:00\n합격자 발표: 2026년 7월 3일';
          document.getElementById('clf-vl-date').textContent  = '마감 완료';
        }
      }
      if (openEl) openEl.style.setProperty('display', 'none', 'important');
      return;
    }

    if (lockEl) lockEl.style.setProperty('display', 'none', 'important');
    if (openEl) openEl.style.setProperty('display', 'block', 'important');

    if (appData && appData.video_link) {
      if (doneEl) doneEl.style.setProperty('display', 'block', 'important');
      if (formEl) formEl.style.setProperty('display', 'none', 'important');
      var lnk = document.getElementById('clf-myVideoLink');
      var cmp = document.getElementById('clf-myVComposer');
      var pce = document.getElementById('clf-myVPiece');
      if (lnk) lnk.textContent = appData.video_link     || '—';
      if (cmp) cmp.textContent = appData.video_composer || '—';
      if (pce) pce.textContent = appData.video_piece    || '—';
    } else {
      if (doneEl) doneEl.style.setProperty('display', 'none', 'important');
      if (formEl) formEl.style.setProperty('display', 'block', 'important');
      setupVideoForm(user, appData);
    }
  }

  function setupVideoForm(user, appData) {
    var btn = document.getElementById('clf-videoSubmitBtn');
    if (!btn || btn._bound) return;
    btn._bound = true;
    btn.addEventListener('click', async function () {
      var link     = (document.getElementById('clf-videoLinkInput').value || '').trim();
      var composer = (document.getElementById('clf-videoComposer').value  || '').trim();
      var piece    = (document.getElementById('clf-videoPiece').value     || '').trim();
      if (!link || !composer || !piece) { alert('영상 링크, 작곡가, 곡명을 모두 입력해 주세요.'); return; }
      if (!link.startsWith('http')) { alert('올바른 URL을 입력해 주세요.'); return; }
      btn.disabled = true; btn.textContent = '제출 중...';
      var { error } = await saveVideoSubmission(user.id, {
        ref_number: appData ? appData.ref_number : '',
        video_link: link, composer: composer, piece: piece,
        submitted_at: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
      });
      if (error) {
        alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        btn.disabled = false; btn.textContent = '영 상 제 출 하 기';
        return;
      }
      document.getElementById('videoSuccessModal').classList.add('clf-show');
    });
  }

  /* ════════════════════════════════════
     로그인/가입 패널 이벤트 (서류 마감 후)
     ════════════════════════════════════ */
  var loginBox = document.getElementById('clf-loginBox');
  var regBox   = document.getElementById('clf-registerBox');
  var goReg    = document.getElementById('clf-goRegister');
  var goLogin  = document.getElementById('clf-goLogin');

  if (goReg) goReg.addEventListener('click', function () {
    if (loginBox) loginBox.style.setProperty('display', 'none', 'important');
    if (regBox)   regBox.style.setProperty('display', 'block', 'important');
  });
  if (goLogin) goLogin.addEventListener('click', function () {
    if (regBox)   regBox.style.setProperty('display', 'none', 'important');
    if (loginBox) loginBox.style.setProperty('display', 'block', 'important');
  });

  var panelLoginBtn = document.getElementById('clf-loginBtn');
  if (panelLoginBtn) panelLoginBtn.addEventListener('click', async function () {
    var em  = (document.getElementById('clf-loginEmail').value || '').trim().toLowerCase();
    var pw  = (document.getElementById('clf-loginPw').value    || '').trim();
    var err = document.getElementById('clf-loginError');
    err.classList.remove('clf-show');
    if (!em || !pw) { err.textContent = '이메일과 비밀번호를 입력해 주세요.'; err.classList.add('clf-show'); return; }
    panelLoginBtn.disabled = true;
    var { data, error } = await sb.auth.signInWithPassword({ email: em, password: pw });
    panelLoginBtn.disabled = false;
    if (error) { err.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.'; err.classList.add('clf-show'); return; }
    await showMyPage(data.user);
  });
  ['clf-loginEmail', 'clf-loginPw'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && panelLoginBtn) panelLoginBtn.click(); });
  });

  var panelRegBtn = document.getElementById('clf-registerBtn');
  if (panelRegBtn) panelRegBtn.addEventListener('click', async function () {
    var em  = (document.getElementById('clf-regEmail').value  || '').trim().toLowerCase();
    var pw  = (document.getElementById('clf-regPw').value     || '').trim();
    var pw2 = (document.getElementById('clf-regPw2').value    || '').trim();
    var err = document.getElementById('clf-registerError');
    err.classList.remove('clf-show');
    if (!em || !pw) { err.textContent = '이메일과 비밀번호를 입력해 주세요.'; err.classList.add('clf-show'); return; }
    if (pw.length < 6) { err.textContent = '비밀번호는 6자 이상이어야 합니다.'; err.classList.add('clf-show'); return; }
    if (pw !== pw2)    { err.textContent = '비밀번호가 일치하지 않습니다.';      err.classList.add('clf-show'); return; }
    panelRegBtn.disabled = true;
    var { data, error } = await sb.auth.signUp({ email: em, password: pw });
    panelRegBtn.disabled = false;
    if (error) { err.textContent = error.message; err.classList.add('clf-show'); return; }
    await showMyPage(data.user);
  });

  var logoutBtn = document.getElementById('clf-logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', async function () {
    await sb.auth.signOut();
    if (myPage)    myPage.style.setProperty('display', 'none', 'important');
    if (authPanel) authPanel.style.setProperty('display', 'block', 'important');
    if (loginBox)  loginBox.style.setProperty('display', 'block', 'important');
    if (regBox)    regBox.style.setProperty('display', 'none', 'important');
  });

  var videoModalClose = document.getElementById('videoModalClose');
  if (videoModalClose) videoModalClose.addEventListener('click', async function () {
    document.getElementById('videoSuccessModal').classList.remove('clf-show');
    var { data: { user } } = await sb.auth.getUser();
    if (user) await showMyPage(user);
  });

  /* ════════════════════
     서류 폼 UI 이벤트
     ════════════════════ */

  /* 분야 토글 */
  document.querySelectorAll('input[name="division"]').forEach(function (r) {
    r.addEventListener('change', function (e) {
      var inst    = document.getElementById('instrumentBox');
      var voc     = document.getElementById('vocalBox');
      var etc     = document.getElementById('divisionEtcBox');
      var instSel = document.getElementById('instrument');
      var etcInp  = document.getElementById('divisionEtc');
      inst.style.setProperty('display', 'none', 'important');
      voc.style.setProperty('display', 'none', 'important');
      etc.classList.remove('clf-show');
      instSel.removeAttribute('required'); etcInp.removeAttribute('required');
      if (e.target.value === '기악')     { inst.style.setProperty('display', 'grid', 'important'); instSel.setAttribute('required', ''); }
      else if (e.target.value === '성악') { voc.style.setProperty('display', 'grid', 'important'); }
      else if (e.target.value === '기타') { etc.classList.add('clf-show'); etcInp.setAttribute('required', ''); }
    });
  });

  /* select 기타 옵션 */
  document.querySelectorAll('.clf-with-etc').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var etcBox = document.getElementById(sel.getAttribute('data-etc'));
      if (!etcBox) return;
      if (sel.value === '기타') {
        etcBox.classList.add('clf-show');
        var inp = etcBox.querySelector('input');
        if (inp && sel.hasAttribute('required')) inp.setAttribute('required', '');
      } else {
        etcBox.classList.remove('clf-show');
        var inp = etcBox.querySelector('input');
        if (inp) inp.removeAttribute('required');
      }
    });
  });

  /* 프로필 사진 압축 */
  var photoInput     = document.getElementById('profilePhoto');
  var photoDataInput = document.getElementById('photoData');
  if (photoInput) {
    photoInput.addEventListener('change', function (e) {
      var file = e.target.files[0];
      if (!file) { photoDataInput.value = ''; return; }
      var reader = new FileReader();
      reader.onload = function (ev) {
        var img = new Image();
        img.onload = function () {
          var canvas = document.createElement('canvas');
          var max = 300, w = img.width, h = img.height;
          if (w > h) { if (w > max) { h = h * max / w; w = max; } }
          else       { if (h > max) { w = w * max / h; h = max; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          photoDataInput.value = canvas.toDataURL('image/jpeg', 0.8);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* 전화번호 포맷 */
  var phoneEl = document.getElementById('phone');
  if (phoneEl) phoneEl.addEventListener('input', function (e) {
    var v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (v.length >= 8)      e.target.value = v.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
    else if (v.length >= 4) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    else                    e.target.value = v;
  });

  /* ════════════════════
     서류 폼 제출
     ════════════════════ */
  var applyForm = document.getElementById('clf-applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      var form = e.target;

      /* 에러 초기화 */
      form.querySelectorAll('.clf-error-msg').forEach(function (el) { el.remove(); });
      form.querySelectorAll('.clf-input-error').forEach(function (el) { el.classList.remove('clf-input-error'); });

      /* 필수값 검사 */
      var isValid = true, firstInvalid = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var ok = true, msg = '필수 항목입니다. 작성해 주세요.';
        if (input.type === 'radio') {
          if (!form.querySelector('input[name="' + input.name + '"]:checked')) { ok = false; msg = '필수 항목입니다. 선택해 주세요.'; }
        } else if (input.type === 'checkbox') {
          if (!input.checked) { ok = false; msg = '필수 항목입니다. 동의해 주세요.'; }
        } else {
          if (!input.value.trim()) { ok = false; }
          else if (!input.validity.valid) { ok = false; msg = '올바른 형식으로 입력해 주세요.'; }
        }
        if (!ok) {
          isValid = false;
          var target = input.type === 'radio'    ? input.closest('.clf-pill-group') :
                       input.type === 'checkbox' ? input.closest('.clf-agree-item') : input;
          if (input.type !== 'radio' && input.type !== 'checkbox') input.classList.add('clf-input-error');
          if (target && !target.dataset.hasError) {
            var errEl = document.createElement('div');
            errEl.className = 'clf-error-msg'; errEl.textContent = msg;
            target.parentNode.insertBefore(errEl, target.nextSibling);
            target.dataset.hasError = 'true';
          }
          if (!firstInvalid) firstInvalid = (input.type === 'radio' ? target : input);
        }
      });
      form.querySelectorAll('[data-has-error]').forEach(function (el) { delete el.dataset.hasError; });
      if (!isValid) {
        if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      /* 계정 이메일/비밀번호 검사 */
      var acctEmail = (document.getElementById('clf-acctEmail').value || '').trim().toLowerCase();
      var acctPw    = (document.getElementById('clf-acctPw').value    || '').trim();
      if (!acctEmail) { alert('계정 이메일을 입력해 주세요.'); document.getElementById('clf-acctEmail').focus(); return; }
      if (acctPw.length < 6) { alert('비밀번호를 6자 이상으로 입력해 주세요.'); document.getElementById('clf-acctPw').focus(); return; }

      /* Supabase 세션 확인 — 없으면 자동 로그인/가입 시도 */
      var { data: { session: curSess } } = await sb.auth.getSession();
      var currentUser = curSess ? curSess.user : null;

      if (!currentUser) {
        /* 계정 없는 경우 가입, 있는 경우 로그인 */
        var signUpResult = await sb.auth.signUp({ email: acctEmail, password: acctPw });
        if (signUpResult.error && signUpResult.error.message.includes('already')) {
          var signInResult = await sb.auth.signInWithPassword({ email: acctEmail, password: acctPw });
          if (signInResult.error) { alert('로그인 실패: ' + signInResult.error.message); return; }
          currentUser = signInResult.data.user;
        } else if (signUpResult.error) {
          alert('계정 생성 실패: ' + signUpResult.error.message); return;
        } else {
          currentUser = signUpResult.data.user;
        }
      }

      if (!currentUser) { alert('인증에 실패했습니다. 다시 시도해 주세요.'); return; }

      /* 최종 확인 */
      if (!confirm('제출하시면 내용을 수정하기 어렵습니다.\n작성하신 내용을 다시 한 번 확인하셨나요? 그대로 제출하시겠습니까?')) return;

      /* 중복 제출 체크 */
      if (!isTestAccount(currentUser.email)) {
        var existing = await getApplication(currentUser.id);
        if (existing) {
          alert('이 계정으로 이미 제출된 서류가 있습니다.\n마이페이지에서 제출 내역을 확인해 주세요.');
          lockApplyForm();
          return;
        }
      }

      var submitBtn = form.querySelector('.clf-submit');
      var origText  = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.style.setProperty('opacity', '.6', 'important');
      submitBtn.textContent = '제출 중...';

      var ref    = 'CLF-2026-' + Math.floor(100000 + Math.random() * 900000);
      var urlP   = new URLSearchParams(window.location.search);
      var medium = urlP.get('utm_medium') || sessionStorage.getItem('utm_medium') || 'free';
      var fd     = new FormData(form);

      /* ── 이미지 업로드 처리 (Supabase Storage) ── */
      var photoDataVal = fd.get('photoData') || '';
      var photoUrl = ''; // Supabase URL

      if (photoDataVal && photoDataVal.startsWith('data:image')) {
        try {
          var blob = dataURLtoBlob(photoDataVal);
          var fileExt = 'jpg';
          var fileName = currentUser.id + '/' + ref + '.' + fileExt;

          // Supabase Storage에 업로드 (실패하더라도 GAS 제출을 위해 막지 않음)
          var { data: uploadData, error: uploadError } = await sb.storage
            .from('profile-photos')
            .upload(fileName, blob, {
              contentType: 'image/jpeg',
              upsert: true
            });

          if (!uploadError) {
            var { data: urlData } = sb.storage.from('profile-photos').getPublicUrl(fileName);
            photoUrl = urlData.publicUrl;
          } else {
            console.error('Storage Upload Error:', uploadError);
            alert('Supabase 저장소 권한 오류입니다. 대시보드에서 Storage RLS 정책(profile-photos)을 허용해주세요.');
            submitBtn.disabled = false;
            submitBtn.style.setProperty('opacity', '1', 'important');
            submitBtn.textContent = origText;
            return;
          }
        } catch (uploadErr) {
          console.warn('Supabase Storage error (ignored):', uploadErr);
        }
      }

      var payload = {
        ref_number:        ref,
        form_type:         'concours',
        submitted_at:      new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        utm_campaign:      urlP.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || 'concours',
        utm_medium:        medium,
        utm_source:        urlP.get('utm_source')   || sessionStorage.getItem('utm_source')   || 'site',
        db_type:           medium === 'paid' ? '유료DB' : '무료DB',
        landed_at:         sessionStorage.getItem('landedAt') || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
        division:          fd.get('division')       || '',
        division_etc:      fd.get('divisionEtc')    || '',
        instrument:        fd.get('instrument')     || '',
        instrument_etc:    fd.get('instrumentEtc')  || '',
        vocal_genre:       fd.get('vocalGenre')     || '',
        vocal_genre_etc:   fd.get('vocalGenreEtc')  || '',
        name_ko:           fd.get('nameKo')         || '',
        birth:             fd.get('birth')          || '',
        gender:            fd.get('gender')         || '',
        phone:             fd.get('phone')          || '',
        email:             fd.get('email')          || '',
        address_city:      fd.get('addressCity')    || '',
        address_district:  fd.get('addressDistrict') || '',
        photo_data:        photoUrl, // Supabase DB에는 URL (성공시) 또는 빈문자열
        school_name:       fd.get('schoolName')     || '',
        career:            fd.get('career')         || '',
        awards:            fd.get('awards')         || '',
        referral:          fd.get('referral')       || '',
        referral_etc:      fd.get('referralEtc')    || '',
        marketing_consent: (document.getElementById('agree5') && document.getElementById('agree5').checked) ? 'Y' : 'N',
        is_test:           isTestAccount(currentUser.email),
      };

      var { error } = await saveApplication(currentUser.id, payload);
      if (error) {
        alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.\n' + error.message);
        submitBtn.disabled = false;
        submitBtn.style.setProperty('opacity', '1', 'important');
        submitBtn.textContent = origText;
        return;
      }

      /* 구글 앱스 스크립트(이메일 발송 및 시트 백업) 호출 */
      var gasPayload = {
        refNumber:        ref,
        formType:         'concours',
        submittedAt:      payload.submitted_at,
        utmCampaign:      payload.utm_campaign,
        utmMedium:        payload.utm_medium,
        utmSource:        payload.utm_source,
        dbType:           payload.db_type,
        division:         payload.division,
        divisionEtc:      payload.division_etc,
        instrument:       payload.instrument,
        instrumentEtc:    payload.instrument_etc,
        vocalGenre:       payload.vocal_genre,
        vocalGenreEtc:    payload.vocal_genre_etc,
        nameKo:           payload.name_ko,
        birth:            payload.birth,
        gender:           payload.gender,
        phone:            payload.phone,
        email:            payload.email,
        addressCity:      payload.address_city,
        addressDistrict:  payload.address_district,
        photoData:        photoUrl, // Supabase URL 전송 (구글 드라이브 거치지 않음)
        schoolName:       payload.school_name,
        career:           payload.career,
        awards:           payload.awards,
        referral:         payload.referral,
        referralEtc:      payload.referral_etc,
        marketingConsent: payload.marketing_consent
      };
      var GAS_URL = 'https://script.google.com/macros/s/AKfycbzh2eZ2jWBhk7z4zvuM0npJZadPz_qxQsT_6lIKUg9ixa1Sh878Q_BbjBNaxJyEWM5o/exec';
      fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(gasPayload)
      }).catch(function(e) { console.error('GAS sync error', e); });

      document.getElementById('refNumber').textContent = '접수번호 · ' + ref;
      document.getElementById('successModal').classList.add('clf-show');
      if (!isTestAccount(currentUser.email)) lockApplyForm();
      else {
        submitBtn.disabled = false;
        submitBtn.style.setProperty('opacity', '1', 'important');
        submitBtn.textContent = origText;
      }
    });
  }

  /* ════════════════════════════════════
     이미 제출한 경우 폼 복원 + 잠금
     ════════════════════════════════════ */
  async function applyLockedStateIfSubmitted(sess) {
    try {
      if (!sess) return;
      if (isTestAccount(sess.user.email)) return;
      var appData = await getApplication(sess.user.id);
      if (!appData) return;
      var applyWrap = document.getElementById('apply');
      if (applyWrap) applyWrap.classList.add('clf-form-visible');
      var ae = document.getElementById('clf-acctEmail');
      if (ae && !ae.value) ae.value = sess.user.email;
      fillFormFromData(dbToFormFields(appData));
      lockApplyForm();
    } catch (err) { /* noop */ }
  }

  /* 서류 제출 완료 모달 닫기 */
  var modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', async function () {
    document.getElementById('successModal').classList.remove('clf-show');
    var { data: { session: s } } = await sb.auth.getSession();
    var fEl = document.getElementById('apply');
    if (fEl) fEl.classList.add('clf-form-visible');
    if (s && isTestAccount(s.user.email)) {
      if (fEl) fEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    var form = document.getElementById('clf-applyForm');
    if (form && !form.classList.contains('clf-form-locked')) lockApplyForm();
    try { if (window.history && window.history.replaceState) window.history.replaceState(null, '', window.location.pathname); } catch (e) { /* noop */ }
    if (fEl) fEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* 약관 전체 동의 */
  var agreeAll = document.getElementById('agreeAll');
  if (agreeAll) {
    var agreeItems = document.querySelectorAll('.clf-agree-item input[type="checkbox"]:not(#agreeAll)');
    agreeAll.addEventListener('change', function () {
      agreeItems.forEach(function (item) { item.checked = agreeAll.checked; });
    });
    agreeItems.forEach(function (item) {
      item.addEventListener('change', function () {
        agreeAll.checked = Array.prototype.every.call(agreeItems, function (i) { return i.checked; });
      });
    });
  }

  /* 업로드 방법 모달 */
  function setupHowToModal(btnId) {
    var btn      = document.getElementById(btnId);
    var modal    = document.getElementById('howToUploadModal');
    var closeBtn = document.getElementById('howToUploadClose');
    function openM()  { if (modal) { modal.classList.add('clf-show'); document.body.style.overflow = 'hidden'; } }
    function closeM() { if (modal) { modal.classList.remove('clf-show'); document.body.style.overflow = ''; } }
    if (btn)      btn.addEventListener('click', openM);
    if (closeBtn) closeBtn.addEventListener('click', closeM);
    if (modal)    modal.addEventListener('click', function (e) { if (e.target === modal) closeM(); });
  }
  setupHowToModal('clf-howToUploadBtn2');

  /* Escape 키로 모달 닫기 */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    ['howToUploadModal', 'videoSuccessModal', 'successModal'].forEach(function (id) {
      var m = document.getElementById(id);
      if (m && m.classList.contains('clf-show')) { m.classList.remove('clf-show'); document.body.style.overflow = ''; }
    });
  });

  /* 뒤로가기(bfcache) 복원 시 재확인 */
  window.addEventListener('pageshow', async function (e) {
    if (e.persisted) {
      var { data: { session: s2 } } = await sb.auth.getSession();
      await applyLockedStateIfSubmitted(s2);
    }
  });

})(); /* end main IIFE */

/* ── 아코디언 토글 ── */
function clfToggleAcc(btn) {
  var acc = btn.closest('.clf-accordion');
  if (acc) acc.classList.toggle('clf-open');
}

/* ══════════════════════════════════════════════
   기관형 인증 모달 초기화
   ══════════════════════════════════════════════ */
(async function initInstModal() {
  var bd      = document.getElementById('clf-instModalBd');
  var xBtn    = document.getElementById('clf-instModalX');
  var tabL    = document.getElementById('clf-instTabLogin');
  var tabR    = document.getElementById('clf-instTabReg');
  var loginBtn = document.getElementById('clf-instLoginBtn');
  var goRegBtn = document.getElementById('clf-instGoReg');
  var regBtn   = document.getElementById('clf-instRegBtn');

  if (xBtn) xBtn.addEventListener('click', closeAuthModal);
  if (bd)   bd.addEventListener('click', function (e) { if (e.target === bd) closeAuthModal(); });
  if (tabL) tabL.addEventListener('click', function () { showInstTab('login'); clearInstErrors(); });
  if (tabR) tabR.addEventListener('click', function () { showInstTab('reg');   clearInstErrors(); });
  if (goRegBtn) goRegBtn.addEventListener('click', function () { showInstTab('reg'); clearInstErrors(); });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bd && bd.classList.contains('clf-show')) closeAuthModal();
  });

  /* Enter 키 지원 */
  ['clf-instLoginEmail', 'clf-instLoginPw'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && loginBtn) loginBtn.click(); });
  });
  ['clf-instRegEmail', 'clf-instRegPw', 'clf-instRegPw2'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter' && regBtn) regBtn.click(); });
  });

  /* ── 모달 로그인 ── */
  if (loginBtn) loginBtn.addEventListener('click', async function () {
    var em  = (document.getElementById('clf-instLoginEmail').value || '').trim().toLowerCase();
    var pw  = (document.getElementById('clf-instLoginPw').value    || '').trim();
    var err = document.getElementById('clf-instLoginErr');
    err.classList.remove('clf-show');
    if (!em || !pw) { err.textContent = '이메일과 비밀번호를 입력해 주세요.'; err.classList.add('clf-show'); return; }
    loginBtn.disabled = true;
    var { data, error } = await sb.auth.signInWithPassword({ email: em, password: pw });
    loginBtn.disabled = false;
    if (error) { err.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.'; err.classList.add('clf-show'); return; }
    var ae = document.getElementById('clf-acctEmail'); if (ae) ae.value = em;
    await proceedToForm(data.user);
  });

  /* ── 모달 회원가입 ── */
  if (regBtn) regBtn.addEventListener('click', async function () {
    var name  = (document.getElementById('clf-instRegName').value  || '').trim();
    var phone = (document.getElementById('clf-instRegPhone').value || '').trim();
    var em    = (document.getElementById('clf-instRegEmail').value || '').trim().toLowerCase();
    var pw    = (document.getElementById('clf-instRegPw').value    || '').trim();
    var pw2   = (document.getElementById('clf-instRegPw2').value   || '').trim();
    var agree = document.getElementById('clf-instRegAgree').checked;
    var err   = document.getElementById('clf-instRegErr');
    err.classList.remove('clf-show');
    if (!name || !phone || !em || !pw) { err.textContent = '모든 필수 항목을 입력해 주세요.'; err.classList.add('clf-show'); return; }
    if (pw.length < 6) { err.textContent = '비밀번호는 6자 이상이어야 합니다.'; err.classList.add('clf-show'); return; }
    if (pw !== pw2)    { err.textContent = '비밀번호가 일치하지 않습니다.';      err.classList.add('clf-show'); return; }
    if (!agree)        { err.textContent = '이용약관 및 개인정보 수집에 동의해 주세요.'; err.classList.add('clf-show'); return; }

    regBtn.disabled = true;
    var { data, error } = await sb.auth.signUp({ email: em, password: pw });
    regBtn.disabled = false;

    if (error) {
      if (error.message.includes('already')) {
        err.textContent = '이미 가입된 이메일입니다. 로그인 탭으로 이동해 주세요.';
      } else {
        err.textContent = error.message;
      }
      err.classList.add('clf-show'); return;
    }

    /* 폼에 이름·연락처 자동 입력 */
    var ae = document.getElementById('clf-acctEmail'); if (ae) ae.value = em;
    var ap = document.getElementById('clf-acctPw');    if (ap) ap.value = pw;
    var fn = document.getElementById('nameKo');        if (fn && !fn.value) fn.value = name;
    var fp = document.getElementById('phone');         if (fp && !fp.value) fp.value = phone;

    await proceedToForm(data.user);
  });

  async function proceedToForm(user) {
    closeAuthModal();
    var formSection = document.getElementById('apply');
    var btnWrap     = document.getElementById('clf-applyBtnWrap');
    if (formSection) {
      formSection.classList.add('clf-form-visible');
      if (btnWrap) btnWrap.style.setProperty('display', 'none', 'important');
      setTimeout(function () { formSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
    }
    /* 이미 제출한 계정이면 복원 + 잠금 */
    if (user && !isTestAccount(user.email)) {
      try {
        var appData = await getApplication(user.id);
        if (appData) {
          if (formSection) formSection.classList.add('clf-form-visible');
          fillFormFromData(dbToFormFields(appData));
          lockApplyForm();
        }
      } catch (err) { /* noop */ }
    }
  }
})();
