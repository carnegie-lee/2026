  /* ── UTM 및 랜딩 정보 저장 ── */
  (function saveLandingInfo() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('utm_campaign') || params.get('utm_source')) {
      sessionStorage.setItem('utm_campaign', params.get('utm_campaign') || 'concours');
      sessionStorage.setItem('utm_medium', params.get('utm_medium') || 'free');
      sessionStorage.setItem('utm_source', params.get('utm_source') || 'site');
      sessionStorage.setItem('landedAt', new Date().toISOString());
    }
  })();

  /* ════════════════════════════════════════════════════
     날짜 상수
     ════════════════════════════════════════════════════ */
  var DOC_DEADLINE = new Date('2026-06-05T18:00:00+09:00');  // 서류 마감
  var VID_OPEN = new Date('2026-06-05T18:02:00+09:00');  // 영상 제출 오픈 (서류 마감 2분 후)
  var VID_DEADLINE = new Date('2026-06-26T18:00:00+09:00');  // 영상 제출 마감

  /* ════════════════════════════════════════════════════
     localStorage 유틸
     ════════════════════════════════════════════════════ */
  var USERS_KEY = 'clf_users_v1';
  var SESSION_KEY = 'clf_session_v1';

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveUsers(u) {
    localStorage.setItem(USERS_KEY, JSON.stringify(u));
  }
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null; } catch (e) { return null; }
  }
  function setSession(email) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: email }));
  }
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  /* ════════════════════════════════════════════════════
     메인 초기화
     ════════════════════════════════════════════════════ */
  (function () {

    var now = new Date();
    var docOpen = now < DOC_DEADLINE;   // 서류 접수 기간 중
    var vidPeriod = now >= VID_OPEN && now < VID_DEADLINE;  // 영상 제출 기간
    var afterVidDead = now >= VID_DEADLINE;

    var openBtn = document.getElementById('clf-applyOpenBtn');
    var closedBanner = document.getElementById('clf-closedBanner');
    var formSection = document.getElementById('apply');
    var ddayTimers = document.querySelectorAll('.clf-dday-timer-wrap');
    var ddayTexts = document.querySelectorAll('.clf-dday-time');
    var authPanel = document.getElementById('clf-authPanel');
    var myPage = document.getElementById('clf-myPage');

    /* ── 서류 접수 타이머 ── */
    function updateDocTimer() {
      var diff = DOC_DEADLINE - new Date();
      if (diff <= 0) {
        if (openBtn) openBtn.style.setProperty('display', 'none', 'important');
        ddayTimers.forEach(function (el) { el.style.setProperty('display', 'none', 'important'); });
        return false;
      }
      ddayTimers.forEach(function (el) { el.style.setProperty('display', 'inline-flex', 'important'); });
      var d = Math.floor(diff / (1000 * 60 * 60 * 24));
      var h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      var m = Math.floor((diff / 1000 / 60) % 60);
      var s = Math.floor((diff / 1000) % 60);
      var txt = '';
      if (d > 0) txt += d + '일 ';
      txt += String(h).padStart(2, '0') + '시간 ' + String(m).padStart(2, '0') + '분 ' + String(s).padStart(2, '0') + '초';
      ddayTexts.forEach(function (el) { el.textContent = txt; });
      return true;
    }

    /* ── 스크롤 인 애니메이션 ── */
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('dir-visible'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('[data-dir-anim]').forEach(function (el) { obs.observe(el); });

    /* ════════════════════
       서류 접수 기간 중
       ════════════════════ */
    if (docOpen) {
      // 버튼 표시, 마감 배너 숨김
      if (closedBanner) closedBanner.style.setProperty('display', 'none', 'important');
      if (openBtn) openBtn.style.setProperty('display', 'inline-flex', 'important');

      if (updateDocTimer()) {
        setInterval(updateDocTimer, 1000);
      }

      if (openBtn) {
        openBtn.addEventListener('click', function () {
          // 로그인 모달 열기
          openAuthModal();
        });
      }

    } else {
      /* ════════════════════
         서류 마감 이후
         ════════════════════ */
      if (openBtn) openBtn.style.setProperty('display', 'none', 'important');
      ddayTimers.forEach(function (el) { el.style.setProperty('display', 'none', 'important'); });
      if (closedBanner) closedBanner.style.setProperty('display', 'block', 'important');

      // 세션 체크 — 이미 로그인 중인지 확인
      var sess = getSession();
      if (sess && sess.email) {
        showMyPage(sess.email);
      } else {
        // 로그인/가입 패널 표시
        if (authPanel) authPanel.style.setProperty('display', 'block', 'important');
      }
    }

    /* ════════════════════
       마이페이지 렌더
       ════════════════════ */
    function showMyPage(email) {
      if (authPanel) authPanel.style.setProperty('display', 'none', 'important');
      if (myPage) myPage.style.setProperty('display', 'block', 'important');

      var users = getUsers();
      var user = users[email] || {};
      var data = user.formData || {};

      // 이름 표시
      var nameEl = document.getElementById('clf-myPageName');
      if (nameEl) nameEl.textContent = (data.nameKo || email) + ' 님, 안녕하세요 👋';

      // 서류 내용 렌더링
      renderSubmission(data);

      // 영상 제출 섹션
      renderVideoSection(email, user, data);
    }

    function renderSubmission(data) {
      var el = document.getElementById('clf-mySubmission');
      if (!el) return;

      if (!data || !data.nameKo) {
        el.innerHTML = '<div class="clf-callout"><div class="clf-callout-icon">ℹ</div><div>제출된 서류 내용이 없습니다.</div></div>';
        return;
      }

      var rows = [
        ['접수번호', data.refNumber || '—'],
        ['접수일시', data.submittedAt || '—'],
        ['경연 분야', data.division || '—'],
        ['세부 악기 / 장르', (data.instrument || data.vocalGenre || data.divisionEtc || '—')],
        ['성명', data.nameKo || '—'],
        ['생년월일', data.birth || '—'],
        ['성별', data.gender || '—'],
        ['휴대전화', data.phone || '—'],
        ['이메일', data.email || '—'],
        ['학교명·전공', data.schoolName || '—'],
        ['활동 경력', data.career || '—'],
        ['수상 내역', data.awards || '—'],
        ['유입 경로', data.referral || '—'],
      ];

      var html = '<div class="clf-submitted-card">' +
        '<div class="clf-submitted-card-header">' +
        '<div class="clf-submitted-card-title">📄 제출한 서류 내용</div>' +
        '<div class="clf-submitted-badge">✓ 서류 접수 완료</div>' +
        '</div>';

      rows.forEach(function (r) {
        html += '<div class="clf-submitted-row">' +
          '<div class="clf-submitted-key">' + r[0] + '</div>' +
          '<div class="clf-submitted-val">' + (r[1] || '—').replace(/\n/g, '<br>') + '</div>' +
          '</div>';
      });

      html += '</div>';
      el.innerHTML = html;
    }

    function renderVideoSection(email, user, data) {
      var lockEl = document.getElementById('clf-videoLocked');
      var openEl = document.getElementById('clf-videoOpen');
      var formEl = document.getElementById('clf-videoForm');
      var doneEl = document.getElementById('clf-videoAlreadySubmitted');
      var now2 = new Date();
      var inPeriod = now2 >= VID_OPEN && now2 < VID_DEADLINE;

      if (!data || !data.nameKo) {
        // 서류를 제출하지 않은 경우
        if (lockEl) {
          lockEl.style.setProperty('display', 'block', 'important');
          document.getElementById('clf-vl-title').textContent = '서류를 제출하지 않으셨습니다';
          document.getElementById('clf-vl-desc').textContent = '영상 제출은 서류를 제출한 참가자만 가능합니다.';
          document.getElementById('clf-vl-date').textContent = '';
        }
        if (openEl) openEl.style.setProperty('display', 'none', 'important');
        return;
      }

      if (!inPeriod) {
        if (lockEl) {
          lockEl.style.setProperty('display', 'block', 'important');
          if (now2 < VID_OPEN) {
            document.getElementById('clf-vl-title').textContent = '영상 제출 기간이 아닙니다';
            document.getElementById('clf-vl-desc').textContent = '서류 접수 마감(6월 5일 18:00) 이후 영상 제출이 열립니다.';
            document.getElementById('clf-vl-date').textContent = '2026년 6월 5일 18:00 이후 열림';
          } else {
            document.getElementById('clf-vl-title').textContent = '영상 제출이 마감되었습니다';
            document.getElementById('clf-vl-desc').textContent = '영상 제출 마감: 2026년 6월 26일 18:00\n합격자 발표: 2026년 7월 3일';
            document.getElementById('clf-vl-date').textContent = '마감 완료';
          }
        }
        if (openEl) openEl.style.setProperty('display', 'none', 'important');
        return;
      }

      // 영상 제출 기간
      if (lockEl) lockEl.style.setProperty('display', 'none', 'important');
      if (openEl) openEl.style.setProperty('display', 'block', 'important');

      if (user.videoData) {
        // 이미 영상 제출 완료
        if (doneEl) doneEl.style.setProperty('display', 'block', 'important');
        if (formEl) formEl.style.setProperty('display', 'none', 'important');
        var lnk = document.getElementById('clf-myVideoLink');
        var cmp = document.getElementById('clf-myVComposer');
        var pce = document.getElementById('clf-myVPiece');
        if (lnk) lnk.textContent = user.videoData.videoLink || '—';
        if (cmp) cmp.textContent = user.videoData.vComposer || '—';
        if (pce) pce.textContent = user.videoData.vPiece || '—';
      } else {
        if (doneEl) doneEl.style.setProperty('display', 'none', 'important');
        if (formEl) formEl.style.setProperty('display', 'block', 'important');
        setupVideoForm(email);
      }
    }

    function setupVideoForm(email) {
      var submitBtn = document.getElementById('clf-videoSubmitBtn');
      if (!submitBtn) return;
      submitBtn.addEventListener('click', function () {
        var link = (document.getElementById('clf-videoLinkInput').value || '').trim();
        var composer = (document.getElementById('clf-videoComposer').value || '').trim();
        var piece = (document.getElementById('clf-videoPiece').value || '').trim();

        if (!link || !composer || !piece) {
          alert('영상 링크, 작곡가, 곡명을 모두 입력해 주세요.');
          return;
        }
        if (!link.startsWith('http')) {
          alert('올바른 URL을 입력해 주세요.');
          return;
        }

        // localStorage에 영상 정보 저장
        var users = getUsers();
        if (!users[email]) users[email] = {};
        users[email].videoData = { videoLink: link, vComposer: composer, vPiece: piece, submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }) };
        saveUsers(users);

        // GAS 전송 (영상 정보 + 서류 refNumber)
        var userData = users[email];
        var formData = userData.formData || {};
        var videoPayload = {
          formType: 'concours_video',
          refNumber: formData.refNumber || '',
          nameKo: formData.nameKo || '',
          email: email,
          videoLink: link,
          vComposer: composer,
          vPiece: piece,
          submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        };

        submitBtn.disabled = true;
        submitBtn.textContent = '제출 중...';

        if (GAS_URL && GAS_URL.indexOf('GOOGLE_APPS_SCRIPT_URL') < 0) {
          fetch(GAS_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(videoPayload)
          }).catch(function () { });
        }

        document.getElementById('videoSuccessModal').classList.add('clf-show');
      });
    }

    /* ════════════════════
       로그인/가입 이벤트
       ════════════════════ */

    // 탭 전환
    var goReg = document.getElementById('clf-goRegister');
    var goLogin = document.getElementById('clf-goLogin');
    var loginBox = document.getElementById('clf-loginBox');
    var regBox = document.getElementById('clf-registerBox');

    if (goReg) goReg.addEventListener('click', function () {
      loginBox.style.setProperty('display', 'none', 'important');
      regBox.style.setProperty('display', 'block', 'important');
    });
    if (goLogin) goLogin.addEventListener('click', function () {
      regBox.style.setProperty('display', 'none', 'important');
      loginBox.style.setProperty('display', 'block', 'important');
    });

    // 로그인
    var loginBtn = document.getElementById('clf-loginBtn');
    if (loginBtn) loginBtn.addEventListener('click', function () {
      var em = (document.getElementById('clf-loginEmail').value || '').trim().toLowerCase();
      var pw = (document.getElementById('clf-loginPw').value || '').trim();
      var errEl = document.getElementById('clf-loginError');
      errEl.classList.remove('clf-show');

      if (!em || !pw) { errEl.textContent = '이메일과 비밀번호를 입력해 주세요.'; errEl.classList.add('clf-show'); return; }
      var users = getUsers();
      if (!users[em] || users[em].password !== btoa(pw)) {
        errEl.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.';
        errEl.classList.add('clf-show');
        return;
      }
      setSession(em);
      showMyPage(em);
    });

    // Enter키 로그인
    ['clf-loginEmail', 'clf-loginPw'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') loginBtn && loginBtn.click(); });
    });

    // 가입
    var registerBtn = document.getElementById('clf-registerBtn');
    if (registerBtn) registerBtn.addEventListener('click', function () {
      var em = (document.getElementById('clf-regEmail').value || '').trim().toLowerCase();
      var pw = (document.getElementById('clf-regPw').value || '').trim();
      var pw2 = (document.getElementById('clf-regPw2').value || '').trim();
      var errEl = document.getElementById('clf-registerError');
      errEl.classList.remove('clf-show');

      if (!em || !pw) { errEl.textContent = '이메일과 비밀번호를 입력해 주세요.'; errEl.classList.add('clf-show'); return; }
      if (pw.length < 6) { errEl.textContent = '비밀번호는 6자 이상이어야 합니다.'; errEl.classList.add('clf-show'); return; }
      if (pw !== pw2) { errEl.textContent = '비밀번호가 일치하지 않습니다.'; errEl.classList.add('clf-show'); return; }
      var users = getUsers();
      if (users[em]) { errEl.textContent = '이미 가입된 이메일입니다. 로그인해 주세요.'; errEl.classList.add('clf-show'); return; }

      users[em] = { password: btoa(pw), formData: null, videoData: null };
      saveUsers(users);
      setSession(em);
      showMyPage(em);
    });

    // 로그아웃
    var logoutBtn = document.getElementById('clf-logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', function () {
      clearSession();
      if (myPage) myPage.style.setProperty('display', 'none', 'important');
      if (authPanel) authPanel.style.setProperty('display', 'block', 'important');
      if (loginBox) loginBox.style.setProperty('display', 'block', 'important');
      if (regBox) regBox.style.setProperty('display', 'none', 'important');
    });

    // 영상 제출 완료 모달 닫기
    var videoModalClose = document.getElementById('videoModalClose');
    if (videoModalClose) videoModalClose.addEventListener('click', function () {
      document.getElementById('videoSuccessModal').classList.remove('clf-show');
      // 페이지 새로고침으로 업데이트된 상태 반영
      var sess = getSession();
      if (sess && sess.email) showMyPage(sess.email);
    });

    /* ════════════════════
       서류 폼 이벤트
       ════════════════════ */

    /* 분야 토글 */
    document.querySelectorAll('input[name="division"]').forEach(function (r) {
      r.addEventListener('change', function (e) {
        var inst = document.getElementById('instrumentBox');
        var voc = document.getElementById('vocalBox');
        var etc = document.getElementById('divisionEtcBox');
        var instSel = document.getElementById('instrument');
        var etcInp = document.getElementById('divisionEtc');

        inst.style.setProperty('display', 'none', 'important');
        voc.style.setProperty('display', 'none', 'important');
        etc.classList.remove('clf-show');
        instSel.removeAttribute('required');
        etcInp.removeAttribute('required');

        if (e.target.value === '기악') {
          inst.style.setProperty('display', 'grid', 'important');
          instSel.setAttribute('required', '');
        } else if (e.target.value === '성악') {
          voc.style.setProperty('display', 'grid', 'important');
        } else if (e.target.value === '기타') {
          etc.classList.add('clf-show');
          etcInp.setAttribute('required', '');
        }
      });
    });

    /* select '기타' 옵션 처리 */
    document.querySelectorAll('.clf-with-etc').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var etcBoxId = sel.getAttribute('data-etc');
        var etcBox = document.getElementById(etcBoxId);
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

    /* 드래그 앤 드롭 */
    document.querySelectorAll('.clf-upload').forEach(function (zone) {
      zone.addEventListener('dragover', function (e) { e.preventDefault(); zone.classList.add('clf-dragover'); });
      zone.addEventListener('dragleave', function () { zone.classList.remove('clf-dragover'); });
      zone.addEventListener('drop', function () { zone.classList.remove('clf-dragover'); });
    });

    /* 프로필 사진 압축 */
    var photoInput = document.getElementById('profilePhoto');
    var photoDataInput = document.getElementById('photoData');
    if (photoInput) {
      photoInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) { photoDataInput.value = ''; return; }
        var reader = new FileReader();
        reader.onload = function (event) {
          var img = new Image();
          img.onload = function () {
            var canvas = document.createElement('canvas');
            var max_size = 300;
            var width = img.width, height = img.height;
            if (width > height) { if (width > max_size) { height *= max_size / width; width = max_size; } }
            else { if (height > max_size) { width *= max_size / height; height = max_size; } }
            canvas.width = width; canvas.height = height;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            photoDataInput.value = canvas.toDataURL('image/jpeg', 0.8);
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    /* 전화번호 포맷 */
    var phoneEl = document.getElementById('phone');
    if (phoneEl) phoneEl.addEventListener('input', function (e) {
      var v = e.target.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);
      if (v.length >= 8) e.target.value = v.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3');
      else if (v.length >= 4) e.target.value = v.replace(/(\d{3})(\d{1,4})/, '$1-$2');
      else e.target.value = v;
    });

    /* ═══════════════════════════════════════
       GAS URL 설정
       ═══════════════════════════════════════ */
    var GAS_URL = 'https://script.google.com/macros/s/AKfycbwz7X4n4QRKQhqe6F_5AVFx1mVEyqsWaiQ-b3K7u_G-_bUSpnLIbiWodlsajRf-XLvrjA/exec';

    /* ═══════════════════════════════════════
       테스트 계정 (잠금/재제출 차단 우회)
       ─ 이 목록의 이메일로 로그인 시 매번 새로 작성·제출 가능
       ─ 시트에는 자동으로 "테스트DB"로 마킹되어 운영 데이터와 구분됨
       ═══════════════════════════════════════ */
    var TEST_ACCOUNTS = ['dajung8474@naver.com'];
    function isTestAccount(email) {
      if (!email) return false;
      return TEST_ACCOUNTS.indexOf((email + '').toLowerCase().trim()) !== -1;
    }

    /* ═══════════════════════════════════════
       주소 (시·도 / 구·군) 연동
       ═══════════════════════════════════════ */
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

    var citySelect = document.getElementById('addressCity');
    var distSelect = document.getElementById('addressDistrict');
    if (citySelect && distSelect) {
      // 1. 시·도 옵션 채우기
      Object.keys(KOREA_ADDRESS).forEach(function(city) {
        var opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        citySelect.appendChild(opt);
      });

      // 2. 시·도 변경 시 구·군 업데이트
      citySelect.addEventListener('change', function() {
        distSelect.innerHTML = '<option value="">— 구·군 선택 —</option>';
        var city = this.value;
        if (KOREA_ADDRESS[city]) {
          KOREA_ADDRESS[city].forEach(function(dist) {
            var opt = document.createElement('option');
            opt.value = dist;
            opt.textContent = dist;
            distSelect.appendChild(opt);
          });
        }
      });
    }

    /* ═══════════════════════════════════════
       서류 폼 제출
       ═══════════════════════════════════════ */
    var applyForm = document.getElementById('clf-applyForm');
    if (applyForm) {
      applyForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var form = e.target;

        /* 계정 이메일/비밀번호 검사 */
        var acctEmail = (document.getElementById('clf-acctEmail').value || '').trim().toLowerCase();
        var acctPw = (document.getElementById('clf-acctPw').value || '').trim();
        if (!acctEmail) { alert('계정 이메일을 입력해 주세요.'); document.getElementById('clf-acctEmail').focus(); return; }
        if (acctPw.length < 6) { alert('비밀번호를 6자 이상으로 입력해 주세요.'); document.getElementById('clf-acctPw').focus(); return; }

        /* 기존 에러 초기화 */
        form.querySelectorAll('.clf-error-msg').forEach(function (el) { el.remove(); });
        form.querySelectorAll('.clf-input-error').forEach(function (el) { el.classList.remove('clf-input-error'); });

        var isValid = true, firstInvalid = null;

        form.querySelectorAll('[required]').forEach(function (input) {
          var isFieldValid = true;
          var msg = '필수 항목입니다. 작성해 주세요.';

          if (input.type === 'radio' || input.type === 'checkbox') {
            if (input.type === 'radio') {
              if (!form.querySelector('input[name="' + input.name + '"]:checked')) {
                isFieldValid = false; msg = '필수 항목입니다. 선택해 주세요.';
              }
            } else if (input.type === 'checkbox') {
              if (!input.checked) { isFieldValid = false; msg = '필수 항목입니다. 동의해 주세요.'; }
            }
          } else {
            if (!input.value.trim()) { isFieldValid = false; }
            else if (!input.validity.valid) { isFieldValid = false; msg = '올바른 형식으로 입력해 주세요.'; }
          }

          if (!isFieldValid) {
            isValid = false;
            var target = input;
            if (input.type === 'radio') target = input.closest('.clf-pill-group');
            else if (input.type === 'checkbox') target = input.closest('.clf-agree-item');
            else input.classList.add('clf-input-error');

            if (target && !target.dataset.hasError) {
              var err = document.createElement('div');
              err.className = 'clf-error-msg';
              err.textContent = msg;
              target.parentNode.insertBefore(err, target.nextSibling);
              target.dataset.hasError = "true";
            }
            if (!firstInvalid) firstInvalid = input.type === 'radio' ? target : input;
          }
        });

        form.querySelectorAll('[data-has-error]').forEach(function (el) { delete el.dataset.hasError; });

        if (!isValid) {
          if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        /* 이미 제출한 계정이면 재제출 차단 (시트에 중복 행이 추가되는 것 방지)
           — 단, 테스트 계정은 매번 새 제출 허용 */
        var users = getUsers();
        var existingUser = users[acctEmail];
        if (existingUser && existingUser.formData && !isTestAccount(acctEmail)) {
          alert('이 이메일로 이미 제출된 서류가 있습니다.\n제출 후에는 수정이 불가합니다. 마이페이지에서 제출 내역을 확인해 주세요.');
          setSession(acctEmail);
          lockApplyForm();
          return;
        }

        /* ⚠️ 제출 직전 최종 확인 — 제출 후엔 수정 불가 */
        if (!confirm('제출하시면 내용을 수정하기 어렵습니다.\n\n작성하신 내용을 다시 한 번 확인하셨나요? 그대로 제출하시겠습니까?')) {
          return; // "이전으로 돌아가기"
        }

        var submitBtn = form.querySelector('.clf-submit');
        var originalText = submitBtn.textContent;
        var ref = 'CLF-2026-' + Math.floor(100000 + Math.random() * 900000);

        var fd = new FormData(form);
        var urlParams = new URLSearchParams(window.location.search);
        var utmCampaign = urlParams.get('utm_campaign') || sessionStorage.getItem('utm_campaign') || 'concours';
        var utmMedium = urlParams.get('utm_medium') || sessionStorage.getItem('utm_medium') || 'free';
        var utmSource = urlParams.get('utm_source') || sessionStorage.getItem('utm_source') || 'site';
        var dbType = (utmMedium === 'paid') ? '유료DB' : '무료DB';

        var payload = {
          refNumber: ref,
          formType: 'concours',
          submittedAt: new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }),
          utmCampaign: utmCampaign, utmMedium: utmMedium, utmSource: utmSource, dbType: dbType,
          landedAt: sessionStorage.getItem('landedAt') || new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
        };
        fd.forEach(function (value, key) { payload[key] = value; });
        payload.marketingConsent = (document.getElementById('agree5') && document.getElementById('agree5').checked) ? 'Y' : 'N';

        /* localStorage에 계정+서류 저장 */
        if (!users[acctEmail]) {
          users[acctEmail] = { password: btoa(acctPw), formData: null, videoData: null };
        }
        users[acctEmail].formData = Object.assign({}, payload);
        saveUsers(users);
        setSession(acctEmail);

        /* GAS 전송 */
        if (!GAS_URL || GAS_URL.indexOf('GOOGLE_APPS_SCRIPT_URL') === 0) {
          document.getElementById('refNumber').textContent = '접수번호 · ' + ref;
          document.getElementById('successModal').classList.add('clf-show');
          if (!isTestAccount(acctEmail)) lockApplyForm();
          return;
        }

        submitBtn.disabled = true;
        submitBtn.style.setProperty('opacity', '.6', 'important');
        submitBtn.textContent = '제출 중...';

        fetch(GAS_URL, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        })
          .then(function () {
            document.getElementById('refNumber').textContent = '접수번호 · ' + ref;
            document.getElementById('successModal').classList.add('clf-show');
            if (!isTestAccount(acctEmail)) lockApplyForm();
            else {
              // 테스트 계정: 다음 테스트를 위해 제출 버튼 복구
              submitBtn.disabled = false;
              submitBtn.style.setProperty('opacity', '1', 'important');
              submitBtn.textContent = originalText;
            }
          })
          .catch(function () {
            alert('제출 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 운영사무국으로 문의해 주세요.');
            submitBtn.disabled = false;
            submitBtn.style.setProperty('opacity', '1', 'important');
            submitBtn.textContent = originalText;
          });
      });
    }

    /* ───────────────────────────────────────────
       제출된 데이터를 폼에 그대로 다시 채우기
       (새로고침/재방문 시 사용자가 자신의 제출 내용 확인 가능)
       ─────────────────────────────────────────── */
    function fillFormFromStorage(data) {
      var form = document.getElementById('clf-applyForm');
      if (!form || !data) return;

      Object.keys(data).forEach(function (key) {
        var inputs = form.querySelectorAll('[name="' + key + '"]');
        if (!inputs.length) return;
        inputs.forEach(function (el) {
          var t = (el.type || '').toLowerCase();
          if (t === 'radio') {
            if (el.value === data[key]) el.checked = true;
          } else if (t === 'checkbox') {
            if (data[key] === 'Y' || data[key] === true || data[key] === 'on') el.checked = true;
          } else if (t !== 'file') {
            el.value = data[key] != null ? data[key] : '';
          }
        });
      });

      // 분야 토글 (기악/성악)에 따라 하위 박스 표시
      var divisionVal = data.division || '';
      var inst = document.getElementById('instrumentBox');
      var voc  = document.getElementById('vocalBox');
      if (inst) inst.style.setProperty('display', divisionVal === '기악' ? 'grid' : 'none', 'important');
      if (voc)  voc.style.setProperty('display',  divisionVal === '성악' ? 'grid' : 'none', 'important');

      // '기타' 옵션 선택된 select는 etc 박스도 펼치기
      form.querySelectorAll('.clf-with-etc').forEach(function (sel) {
        if (sel.value === '기타') {
          var etcBox = sel.dataset.etc ? document.getElementById(sel.dataset.etc) : null;
          if (etcBox) etcBox.classList.add('clf-show');
        }
      });

      // 사진 파일은 다시 첨부 불가 — 안내문구 옆에 표시 가능
      // (파일 input 자체를 비활성화 처리는 lockApplyForm에서 함)
    }

    /* ───────────────────────────────────────────
       폼 잠금 처리 — 제출 후 수정 불가 시각화
       ─────────────────────────────────────────── */
    function lockApplyForm() {
      var form = document.getElementById('clf-applyForm');
      if (!form) return;
      if (form.classList.contains('clf-form-locked')) return; // 중복 방지

      // 안내 배너
      if (!form.querySelector('.clf-locked-banner')) {
        var banner = document.createElement('div');
        banner.className = 'clf-locked-banner';
        banner.innerHTML = '✓ <b>제출 완료</b> · 아래는 제출하신 내용입니다. 더 이상 수정할 수 없으며, 변경이 필요하시면 <a href="tel:1588-8418" style="color:#fff;font-weight:700;text-decoration:underline;">1588-8418</a>로 문의해 주세요.';
        form.insertBefore(banner, form.firstChild);
      }

      form.classList.add('clf-form-locked');

      // 모든 입력 비활성화 (CSS에서 색상은 또렷이 유지됨)
      form.querySelectorAll('input, select, textarea, button').forEach(function (el) {
        el.disabled = true;
      });
    }

    /* ───────────────────────────────────────────
       페이지 진입 시: 이미 제출한 사용자면
       (1) 폼 영역 보이기 (2) 저장된 입력값 복원 (3) 잠금
       ─────────────────────────────────────────── */
    function applyLockedStateIfSubmitted() {
      try {
        var sess = (typeof getSession === 'function') ? getSession() : null;
        if (!sess || !sess.email) return;
        // 테스트 계정은 항상 새로 작성 가능
        if (isTestAccount(sess.email)) return;
        var us = (typeof getUsers === 'function') ? getUsers() : null;
        var data = us && us[sess.email] && us[sess.email].formData;
        if (!data) return;

        // 폼 영역 표시 (#apply가 숨겨져 있을 수 있음)
        var applyWrap = document.getElementById('apply');
        if (applyWrap) applyWrap.classList.add('clf-form-visible');

        // 계정 이메일 자동 채움
        var acctEmail = document.getElementById('clf-acctEmail');
        if (acctEmail && !acctEmail.value) acctEmail.value = sess.email;

        fillFormFromStorage(data);
        lockApplyForm();
      } catch (err) { /* noop */ }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyLockedStateIfSubmitted);
    } else {
      applyLockedStateIfSubmitted();
    }
    // 뒤로가기로 돌아왔을 때(bfcache 복원)도 다시 잠금 확인
    window.addEventListener('pageshow', function (e) {
      applyLockedStateIfSubmitted();
    });

    /* 모달 닫기 (서류 제출 완료) — 잠긴 폼이 화면에 그대로 남도록
       콩쿨 폼이 곧 메인이므로 별도 이동 없이 잠금 상태로 표시. UTM 흔적 제거 위해
       쿼리스트링/해시는 history에서 깔끔하게 교체. */
    var modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', function () {
      document.getElementById('successModal').classList.remove('clf-show');
      var sess = getSession();
      var fEl = document.getElementById('apply');
      if (fEl) fEl.classList.add('clf-form-visible');

      // 테스트 계정: 잠금 안 함, 폼 그대로 둠
      if (sess && isTestAccount(sess.email)) {
        if (fEl && fEl.scrollIntoView) fEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // 일반 사용자: 폼 잠금 보강 + URL의 query/hash 정리 (history 교체 → 뒤로가기 시 광고 진입 URL로 안 돌아감)
      var form = document.getElementById('clf-applyForm');
      if (form && !form.classList.contains('clf-form-locked')) {
        lockApplyForm();
      }
      try {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (e) { /* noop */ }
      if (fEl && fEl.scrollIntoView) fEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    /* ── 업로드 방법 모달 ── */
    function setupHowToModal(btnId) {
      var btn = document.getElementById(btnId);
      var modal = document.getElementById('howToUploadModal');
      var closeBtn = document.getElementById('howToUploadClose');
      function openM() { modal.classList.add('clf-show'); document.body.style.overflow = 'hidden'; }
      function closeM() { modal.classList.remove('clf-show'); document.body.style.overflow = ''; }
      if (btn) btn.addEventListener('click', openM);
      if (closeBtn) closeBtn.addEventListener('click', closeM);
      if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) closeM(); });
    }
    setupHowToModal('clf-howToUploadBtn2');
    document.addEventListener('keydown', function (e) {
      var m = document.getElementById('howToUploadModal');
      if (m && e.key === 'Escape' && m.classList.contains('clf-show')) {
        m.classList.remove('clf-show'); document.body.style.overflow = '';
      }
      var vs = document.getElementById('videoSuccessModal');
      if (vs && e.key === 'Escape' && vs.classList.contains('clf-show')) vs.classList.remove('clf-show');
      var ss = document.getElementById('successModal');
      if (ss && e.key === 'Escape' && ss.classList.contains('clf-show')) ss.classList.remove('clf-show');
    });

    /* ── 약관 전체 동의 마스터 체크박스 ── */
    var agreeAll = document.getElementById('agreeAll');
    if (agreeAll) {
      var agreeItems = document.querySelectorAll('.clf-agree-item input[type="checkbox"]:not(#agreeAll)');
      agreeAll.addEventListener('change', function () {
        agreeItems.forEach(function (item) { item.checked = agreeAll.checked; });
      });
      agreeItems.forEach(function (item) {
        item.addEventListener('change', function () {
          var all = Array.prototype.every.call(agreeItems, function (i) { return i.checked; });
          agreeAll.checked = all;
        });
      });
    }

  })();

  /* 아코디언 토글 */
  function clfToggleAcc(btn) {
    var acc = btn.closest('.clf-accordion');
    if (acc) acc.classList.toggle('clf-open');
  }

  /* ══════════════════════════════════════════════════
     기관형 로그인 모달
     ══════════════════════════════════════════════════ */
  function openAuthModal() {
    var bd = document.getElementById('clf-instModalBd');
    if (!bd) return;
    // 패널 초기 상태 리셋
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
      lp.style.display = ''; rp.style.display = 'none';
      lt.classList.add('clf-inst-active'); rt.classList.remove('clf-inst-active');
      setTimeout(function () { var e = document.getElementById('clf-instLoginEmail'); if (e) e.focus(); }, 80);
    } else {
      rp.style.display = ''; lp.style.display = 'none';
      rt.classList.add('clf-inst-active'); lt.classList.remove('clf-inst-active');
      setTimeout(function () { var e = document.getElementById('clf-instRegEmail'); if (e) e.focus(); }, 80);
    }
  }
  function clearInstErrors() {
    ['clf-instLoginErr', 'clf-instRegErr'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.textContent = ''; el.classList.remove('clf-show'); }
    });
  }
  function proceedToForm() {
    closeAuthModal();
    var formSection = document.getElementById('apply');
    var btnWrap = document.getElementById('clf-applyBtnWrap');
    if (formSection) {
      formSection.classList.add('clf-form-visible');
      if (btnWrap) btnWrap.style.setProperty('display', 'none', 'important');
      setTimeout(function () { formSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
    }
    // 이미 제출한 계정으로 로그인했다면 입력값 복원 + 폼 잠금
    if (typeof applyLockedStateIfSubmitted === 'function') {
      setTimeout(applyLockedStateIfSubmitted, 50);
    }
  }

  (function initInstModal() {
    var bd = document.getElementById('clf-instModalBd');
    var xBtn = document.getElementById('clf-instModalX');
    var tabL = document.getElementById('clf-instTabLogin');
    var tabR = document.getElementById('clf-instTabReg');
    var loginBtn = document.getElementById('clf-instLoginBtn');
    var goRegBtn = document.getElementById('clf-instGoReg');
    var regBtn = document.getElementById('clf-instRegBtn');

    if (xBtn) xBtn.addEventListener('click', closeAuthModal);
    if (bd) bd.addEventListener('click', function (e) { if (e.target === bd) closeAuthModal(); });
    if (tabL) tabL.addEventListener('click', function () { showInstTab('login'); clearInstErrors(); });
    if (tabR) tabR.addEventListener('click', function () { showInstTab('reg'); clearInstErrors(); });
    if (goRegBtn) goRegBtn.addEventListener('click', function () { showInstTab('reg'); clearInstErrors(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && bd && bd.classList.contains('clf-show')) closeAuthModal();
    });

    // Enter 키 지원
    ['clf-instLoginEmail', 'clf-instLoginPw'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') loginBtn && loginBtn.click(); });
    });
    ['clf-instRegEmail', 'clf-instRegPw', 'clf-instRegPw2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('keydown', function (e) { if (e.key === 'Enter') regBtn && regBtn.click(); });
    });

    /* 로그인 */
    if (loginBtn) loginBtn.addEventListener('click', function () {
      var em = (document.getElementById('clf-instLoginEmail').value || '').trim().toLowerCase();
      var pw = (document.getElementById('clf-instLoginPw').value || '').trim();
      var err = document.getElementById('clf-instLoginErr');
      err.classList.remove('clf-show');
      if (!em || !pw) { err.textContent = '이메일과 비밀번호를 입력해 주세요.'; err.classList.add('clf-show'); return; }
      var users = getUsers();
      if (!users[em] || users[em].password !== btoa(pw)) {
        err.textContent = '이메일 또는 비밀번호가 올바르지 않습니다.'; err.classList.add('clf-show'); return;
      }
      setSession(em);
      /* 계정 이메일 필드에 자동 입력 */
      var ae = document.getElementById('clf-acctEmail'); if (ae) ae.value = em;
      proceedToForm();
    });

    /* 가입 */
    if (regBtn) regBtn.addEventListener('click', function () {
      var name = (document.getElementById('clf-instRegName').value || '').trim();
      var phone = (document.getElementById('clf-instRegPhone').value || '').trim();
      var em = (document.getElementById('clf-instRegEmail').value || '').trim().toLowerCase();
      var pw = (document.getElementById('clf-instRegPw').value || '').trim();
      var pw2 = (document.getElementById('clf-instRegPw2').value || '').trim();
      var agree = document.getElementById('clf-instRegAgree').checked;
      var err = document.getElementById('clf-instRegErr');
      err.classList.remove('clf-show');
      
      if (!name || !phone || !em || !pw) { err.textContent = '모든 필수 항목을 입력해 주세요.'; err.classList.add('clf-show'); return; }
      if (pw.length < 6) { err.textContent = '비밀번호는 6자 이상이어야 합니다.'; err.classList.add('clf-show'); return; }
      if (pw !== pw2) { err.textContent = '비밀번호가 일치하지 않습니다.'; err.classList.add('clf-show'); return; }
      if (!agree) { err.textContent = '이용약관 및 개인정보 수집에 동의해 주세요.'; err.classList.add('clf-show'); return; }
      
      var users = getUsers();
      if (users[em] && users[em].formData) {
        err.textContent = '이미 서류를 제출한 이메일입니다. 로그인해 주세요.'; err.classList.add('clf-show'); return;
      }
      if (!users[em]) users[em] = { password: btoa(pw), name: name, phone: phone, formData: null, videoData: null };
      saveUsers(users);
      setSession(em);
      
      /* 계정 이메일/비밀번호 필드에 자동 입력 */
      var ae = document.getElementById('clf-acctEmail'); if (ae) ae.value = em;
      var ap = document.getElementById('clf-acctPw'); if (ap) ap.value = pw;
      
      /* 메인 폼에도 이름/연락처 자동 입력 */
      var fn = document.getElementById('clf-name'); if (fn && !fn.value) fn.value = name;
      var fp = document.getElementById('clf-phone'); if (fp && !fp.value) fp.value = phone;

      proceedToForm();
    });
  })();
