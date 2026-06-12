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
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.06.01(周一) ~ 06.30(周二)</strong> 报名表·视频提交 <span style="color:#B54E3A;font-weight:700;">(截止 6.30(周二) 18:00)</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.03(周五)</strong> 复赛入围者公布</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.13(周一)</strong> 复赛(现场评审)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.16(周四)</strong> 决赛(现场评审)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.08.11(周二)</strong> [卡内基LEE基金会 成立7周年纪念 曹秀美邀请音乐会] 当天</span></li>',
      /* 신청 버튼 */
      'btn.apply': '填写报名表',
      'btn.applyClosed': '报名已截止'
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
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.06.01 (Mon) – 06.30 (Tue)</strong> Application &amp; video submission <span style="color:#B54E3A;font-weight:700;">(deadline Jun 30 (Tue) 18:00)</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.03 (Fri)</strong> Main-round participants announced</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.13 (Mon)</strong> Main Round (in-person judging)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.07.16 (Thu)</strong> Final Round (in-person judging)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.08.11 (Tue)</strong> [Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert] day</span></li>',
      /* Apply button */
      'btn.apply': 'Fill out the application',
      'btn.applyClosed': 'Applications closed'
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
