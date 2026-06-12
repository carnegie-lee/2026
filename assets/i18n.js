/* ════════════════════════════════════════════════════════════
   다국어(한국어/中文简体/English) 전환 엔진
   - concours.js 는 수정하지 않음
   - 한국어는 DOM 원본을 그대로 사용(사전에 ko 없음)
   - 태그 방식:
       data-i18n      → textContent 교체 (단순 텍스트, JS가 참조하는 요소도 안전)
       data-i18n-html → innerHTML 교체 (줄바꿈/굵게 등 마크업 포함 블록)
       data-i18n-ph   → placeholder 교체 (input/textarea)
   - 번역문 추가는 아래 DICT 의 zh / en 에 "키": "번역" 으로만 넣으면 됩니다.
   ════════════════════════════════════════════════════════════ */
(function () {
  var LANG_KEY = 'clf_lang';

  var DICT = {
    zh: {
      /* 상단바 */
      'qb.guide': '简章预览',
      'qb.kakao': 'KakaoTalk 咨询',
      'qb.phone': '基金会电话',
      /* 헤더 */
      'hdr.title': '报名参加',
      'hdr.sub': '卡内基LEE基金会 第一届音乐比赛',
      /* 인트로 네임배지 */
      'intro.nameko': '卡内基LEE基金会 第一届音乐比赛',
      'intro.namenick': '&lt;纽约卡内基音乐厅 新人艺术家选拔赛&gt;<br>卡内基LEE基金会 成立7周年纪念 曹秀美邀请音乐会',
      /* 인트로 인사말 */
      'intro.h2': '从艺考生到现役艺术家,<br>发掘新一代音乐人才',
      'intro.p1': '本次比赛为纪念卡内基Lee基金会成立7周年及世界级女高音曹秀美出道40周年而举办,是发掘与培养新一代音乐人才项目的一环。',
      'intro.p2': '无论是备考学生,还是正活跃于舞台的现役艺术家,只要在器乐或声乐领域具备充分的实力与经历,任何人均可参加。',
      'intro.p3': '通过一次性提交报名表与演奏视频的单一选拔方式选出决赛入围者;经决赛角逐获奖者,将获得包括美国纽约卡内基音乐厅(Carnegie Hall)演出舞台在内、助其成长为新一代艺术家的全方位礼遇。',
      /* 공식 일정 */
      'sec.schedule': '官方日程',
      'schedule.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.06.01(周一) ~ 06.30(周二)</strong> 报名表·视频提交 <span style="color:#B54E3A;font-weight:700;">(截止 6.30(周二) 17:00 中国时间)</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.03(周五)</strong> 复赛入围者公布</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.13(周一)</strong> 复赛(现场评审)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.16(周四)</strong> 决赛(现场评审)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.08.11(周二)</strong> [卡内基LEE基金会 成立7周年纪念 曹秀美邀请音乐会] 当天</span></li>',
      /* 신청 버튼 */
      'btn.apply': '填写报名表',
      'btn.applyClosed': '报名已截止',
      /* D-day 타이머 */
      'timer.left': '距报名截止还有',
      'timer.remain': '',
      /* 로그인 / 회원가입 모달 */
      'modal.subtitle': '古典音乐比赛 2026 报名',
      'modal.tabLogin': '登录',
      'modal.tabReg': '注册',
      'modal.loginBtn': '登录并填写报名表',
      'modal.noAccount': '还没有账号?',
      'modal.goRegBtn': '注册并填写报名表',
      'modal.regBtn': '注册并填写报名表',
      'modal.emailSentTitle': '验证邮件已发送',
      'modal.emailSentBody': '我们已向您填写的邮箱发送了验证邮件。<br>请查收邮件并<strong>点击验证链接</strong>。<br><br>验证完成后请返回本页并<strong>登录</strong>。',
      'modal.emailSentOk': '确认',
      'modal.spamNote': '如果没有收到邮件,请检查垃圾邮件文件夹。',
      'modal.footer': '<strong>卡内基Lee基金会</strong> &middot; 2026古典音乐比赛 &middot; 运营事务局 <a href="tel:1588-8418" style="color:#0C3D40;font-weight:700;text-decoration:none;">1588-8418</a><br>账号信息用于登录以查看您的提交内容。',
      /* 공용 폼 라벨/플레이스홀더 */
      'f.email': '邮箱',
      'f.password': '密码',
      'ph.password': '请输入密码',
      'reg.name': '姓名 <span style="color:#B54E3A">*</span>',
      'ph.name': '张三',
      'reg.phone': '联系电话 <span style="color:#B54E3A">*</span>',
      'reg.email': '邮箱(账号) <span style="color:#B54E3A">*</span>',
      'ph.regEmail': '用于登录的邮箱',
      'reg.pw': '密码 <span style="color:#B54E3A">*</span>',
      'ph.regPw': '6位以上,字母+数字',
      'reg.pw2': '确认密码 <span style="color:#B54E3A">*</span>',
      'ph.regPw2': '请再次输入密码',
      'reg.agree': '[必填] 我已阅读并同意服务条款及个人信息收集·使用。'
    },

    en: {
      /* Top bar */
      'qb.guide': 'Guidelines',
      'qb.kakao': 'KakaoTalk',
      'qb.phone': 'Call us',
      /* Header */
      'hdr.title': 'Application',
      'hdr.sub': 'Carnegie LEE Foundation — 1st Concours',
      /* Intro name badge */
      'intro.nameko': 'Carnegie LEE Foundation — 1st Concours',
      'intro.namenick': '&lt;New York Carnegie Hall New Artist Selection&gt;<br>Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert',
      /* Intro greeting */
      'intro.h2': 'From students to professional artists —<br>discovering the next generation of musical talent',
      'intro.p1': 'Held to commemorate the 7th anniversary of the Carnegie Lee Foundation and the 40th debut anniversary of world-renowned soprano Sumi Jo, this concours is part of an initiative to discover and nurture the next generation of musicians.',
      'intro.p2': 'From students preparing for entrance exams to professional artists currently performing, anyone with sufficient skill and experience in instrumental or vocal music may take part.',
      'intro.p3': 'Finalists are chosen through a single screening in which the application and performance video are submitted together. Winners of the final competition receive extensive benefits to grow into next-generation artists, including a performance on the stage of Carnegie Hall in New York.',
      /* Official schedule */
      'sec.schedule': 'Official Schedule',
      'schedule.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.06.01 (Mon) – 06.30 (Tue)</strong> Application &amp; video submission <span style="color:#B54E3A;font-weight:700;">(deadline Jun 30 (Tue) 05:00, New York / EDT)</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.03 (Fri)</strong> Main-round participants announced</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.13 (Mon)</strong> Main Round (in-person judging)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.16 (Thu)</strong> Final Round (in-person judging)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.08.11 (Tue)</strong> [Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert] day</span></li>',
      /* Apply button */
      'btn.apply': 'Fill out the application',
      'btn.applyClosed': 'Applications closed',
      /* D-day timer */
      'timer.left': '',
      'timer.remain': 'left until the deadline',
      /* Login / sign-up modal */
      'modal.subtitle': 'Classical Concours 2026 — Application',
      'modal.tabLogin': 'Log in',
      'modal.tabReg': 'Sign up',
      'modal.loginBtn': 'Log in & start application',
      'modal.noAccount': "Don't have an account yet?",
      'modal.goRegBtn': 'Sign up & start application',
      'modal.regBtn': 'Sign up & start application',
      'modal.emailSentTitle': 'Verification email sent',
      'modal.emailSentBody': "We've sent a verification email to the address you entered.<br>Please check your inbox and <strong>click the verification link</strong>.<br><br>Once verified, come back here and <strong>log in</strong>.",
      'modal.emailSentOk': 'OK',
      'modal.spamNote': "If the email doesn't arrive, please check your spam folder.",
      'modal.footer': '<strong>Carnegie Lee Foundation</strong> &middot; 2026 Classical Concours &middot; Office <a href="tel:1588-8418" style="color:#0C3D40;font-weight:700;text-decoration:none;">1588-8418</a><br>Your account is used to log in and review your submission.',
      /* Common form labels / placeholders */
      'f.email': 'Email',
      'f.password': 'Password',
      'ph.password': 'Enter your password',
      'reg.name': 'Name <span style="color:#B54E3A">*</span>',
      'ph.name': 'e.g. John Smith',
      'reg.phone': 'Phone <span style="color:#B54E3A">*</span>',
      'reg.email': 'Email (ID) <span style="color:#B54E3A">*</span>',
      'ph.regEmail': 'Email to use for login',
      'reg.pw': 'Password <span style="color:#B54E3A">*</span>',
      'ph.regPw': '6+ chars, letters & numbers',
      'reg.pw2': 'Confirm password <span style="color:#B54E3A">*</span>',
      'ph.regPw2': 'Re-enter your password',
      'reg.agree': '[Required] I agree to the Terms of Service and the collection & use of personal information.'
    }
  };

  var origText = new WeakMap();
  var origHTML = new WeakMap();
  var origPH   = new WeakMap();

  function get(lang, key) {
    return (DICT[lang] && DICT[lang][key] != null) ? DICT[lang][key] : null;
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (!origText.has(el)) origText.set(el, el.textContent);
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n'));
      el.textContent = (t == null) ? origText.get(el) : t;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      if (!origHTML.has(el)) origHTML.set(el, el.innerHTML);
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n-html'));
      el.innerHTML = (t == null) ? origHTML.get(el) : t;
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      if (!origPH.has(el)) origPH.set(el, el.getAttribute('placeholder') || '');
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n-ph'));
      el.setAttribute('placeholder', (t == null) ? origPH.get(el) : t);
    });

    document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-CN' : (lang === 'en' ? 'en' : 'ko'));
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.classList.toggle('clf-lang-active', b.getAttribute('data-lang-btn') === lang);
    });
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) { /* noop */ }
    window.__clfLang = lang;
  }

  window.clfSetLang = apply;

  function init() {
    var saved = 'ko';
    try { saved = localStorage.getItem(LANG_KEY) || 'ko'; } catch (e) { /* noop */ }
    apply(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
