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
      'reg.agree': '[必填] 我已阅读并同意服务条款及个人信息收集·使用。',
      /* 상세: 모집부문 */
      'sec.categories': '招募组别',
      'categories.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>声乐及器乐全部组别</strong>(乐器不限)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>仅限个人参赛</strong> · 不接受团体参赛</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text">预选及复赛各提交 <strong>自选曲目1首</strong> 演奏视频<br><span style="font-size:12px; color:#666;">※ 预选与复赛不可使用同一曲目。</span></span></li>',
      /* 상세: 제출자료 */
      'sec.submission': '提交材料',
      'submission.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text">在线<strong>报名</strong>(含经历·学历)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>演奏视频共享链接</strong>(单一镜头无剪辑原片)· 与报名表<strong>同时提交</strong></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text">所有曲目原则上须<strong>背谱演奏</strong></span></li>',
      /* 상세: 시상내역 */
      'sec.awards': '奖项设置',
      'awards.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-top">大奖</span><strong>卡内基LEE大奖</strong><span class="sub">提供美国纽约卡内基音乐厅(Carnegie Hall)演出机会(机票、食宿费全额由基金会承担)· [卡内基LEE基金会成立7周年纪念 曹秀美邀请音乐会] 正式开场单独演出 · 颁发理事长奖牌</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-top">最优秀奖</span><strong>卡内基LEE最优秀奖</strong><span class="sub">提供美国纽约卡内基音乐厅(Carnegie Hall)演出机会(机票由基金会承担)· [卡内基LEE基金会成立7周年纪念 曹秀美邀请音乐会] 正式开场演出 · 颁发理事长奖牌</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-top">优秀奖</span><strong>卡内基LEE优秀奖</strong><span class="sub">提供美国纽约卡内基音乐厅(Carnegie Hall)演出机会(机票及食宿费自理)· [卡内基LEE基金会成立7周年纪念 曹秀美邀请音乐会] 正式开场演出 · 颁发理事长奖牌</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-all">1~10名</span><strong>共同礼遇</strong><span class="sub">持续参与基金会主办的国内外文化活动并获得演出机会 · 在曹秀美音乐会官方节目册中单独整版刊登个人简介 · 正式受邀出席与艺术家及企业家共同参加的私人庆功酒会</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag" style="background:#FDF5F6 !important; color:#B54E3A !important; border:1px solid #F6DFE2 !important;">限10名</span><strong>特别奖</strong><span class="sub">麦塞纳企业家奖(每人1,000,000韩元)· 发放奖学金(共10,000,000韩元)</span></span></li>',
      /* 상세: 특별혜택 */
      'sec.benefit': '参赛者专属福利',
      'benefit.callout': '<strong>全体参赛者福利!&lt;卡内基LEE基金会成立7周年纪念 曹秀美邀请音乐会&gt; 当日门票2张赞助</strong><br>基金会向本次比赛<strong>全体参赛者</strong>赞助8月11日(周二)<strong>成立7周年纪念 曹秀美邀请音乐会</strong>当日活动门票<strong>2张</strong>。',
      'awards.notice': '<strong style="color:#444;">※ 注意事项</strong><br>· 根据评审结果,可能不产生获奖者。<br>· 奖金将依据大韩民国税法扣除税款后,按奖金支付协议发放。',
      /* 상세: 영상 가이드 */
      'sec.videoguide': '视频拍摄·提交指南',
      'vg.intro': '自选曲目1首。请务必阅读以下指南后,在报名表底部提交视频链接。',
      'vg.memo': '<strong>所有曲目原则上须背谱(暗谱)演奏。</strong><br>请以不看乐谱、凭记忆演奏为前提选择曲目。看谱演奏的视频可能被排除在评审之外。',
      'vg.acc1title': '<span class="clf-acc-icon">1</span> 拍摄指南 (Filming Guide)',
      'vg.acc1list':
        '<li><strong>必须全身入镜</strong> — 演奏者从头到脚及整件乐器都须完整出现在画面中。(声乐须上半身全身+表情清晰可见)</li>' +
        '<li><strong>本人确认报幕</strong> — 视频开始前须面向镜头,用本人声音说出<strong>"出生年月日(如020025)。姓名。曲目名。现在开始"</strong>后再开始演奏。</li>' +
        '<li><strong>无剪辑单一镜头</strong> — 须为从头到尾一次性录制的原片。剪辑·多机位合成·画面分割·字幕插入·音频修饰均<strong>禁止</strong>。</li>' +
        '<li><strong>固定机位</strong> — 使用三脚架等固定拍摄。禁止变焦推近·拉远·摇移。</li>' +
        '<li><strong>分辨率</strong> — 建议 <code>1920×1080 (FHD)</code> 以上,<code>1280×720 (HD)</code> 以上为必须。</li>' +
        '<li><strong>亮度·照明</strong> — 演奏者的面部与手部动作须清晰可辨。禁止逆光拍摄。</li>' +
        '<li><strong>录制有效期</strong> — 仅认可2026年1月1日以后的拍摄。</li>',
      'vg.acc2title': '<span class="clf-acc-icon">2</span> 音频指南 (Audio Guide)',
      'vg.acc2list':
        '<li><strong>现场同期录音</strong> — 须为与视频同时录制的原声音频。禁止单独录音后再覆盖到视频的配音·后期处理。</li>' +
        '<li><strong>禁止音频修饰</strong> — 均衡器(EQ)·混响·压缩器·噪声门等一切后期修饰均禁止。</li>' +
        '<li><strong>麦克风</strong> — 建议使用外接麦克风。相机内置麦克风亦可,但不得出现破音(削波)。</li>' +
        '<li><strong>环境噪音</strong> — 请注意避免空调·手机提示音·外部车辆噪音等混入。</li>',
      'vg.acc3title': '<span class="clf-acc-icon">3</span> 文件规格 (File Specification)',
      'vg.acc3list':
        '<li><strong>提交方式</strong> — 须先上传至 <strong>Google 云端硬盘</strong>,再提交 <strong>“共享链接”</strong>。<span style="color:#888;">(YouTube·Vimeo 等其他平台不可)</span></li>' +
        '<li><strong>文件格式</strong> — 建议 <code>.mp4</code> 或 <code>.mov</code> <span style="color:#888;">(<code>.avi</code>·<code>.wmv</code>·<code>.mkv</code> 等不予受理)</span></li>' +
        '<li><strong>容量限制</strong> — 最大 <code>2GB</code> 以内。</li>' +
        '<li><strong>文件命名规则</strong> — <code>组别_姓名_曲名.mp4</code><br><span style="color:#888;font-size:12px;">例)钢琴_张三_Chopin Etude Op.10-4.mp4</span></li>' +
        '<li><strong>视频时长</strong> — 无特别限制,按实际演奏时间提交(通常 <strong>8~15分钟左右</strong>)。</li>' +
        '<li><strong>权限设置</strong> — 须将 Google 云端硬盘访问权限更改为 <code>“知道链接的所有人”</code>。<div style="background: #fff0f0; border-left: 3px solid #d32f2f; padding: 10px 14px; margin-top: 8px; font-size: 13.5px; color: #d32f2f; line-height: 1.5; word-break: keep-all; border-radius: 4px;"><strong>※ 须将设置更改为 [常规访问 &gt; “知道链接的所有人”]</strong> 方可进行评审。<br>(若因权限受限导致无法观看视频,可能在评审中受到不利影响。)</div></li>',
      'img.poster': 'poster_11_en.png'
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
      'reg.agree': '[Required] I agree to the Terms of Service and the collection & use of personal information.',
      /* Details: categories */
      'sec.categories': 'Eligible Categories',
      'categories.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>All vocal & instrumental categories</strong> (no instrument restriction)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>Individual entry only</strong> · team entries are not accepted</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text">Submit a performance video of <strong>one free-choice piece</strong> for each of the preliminary and main rounds<br><span style="font-size:12px; color:#666;">※ The preliminary and main rounds may not use the same piece.</span></span></li>',
      /* Details: submission */
      'sec.submission': 'What to Submit',
      'submission.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text">Online <strong>application</strong> (including career & education)</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>Performance video share link</strong> (single-take, unedited original) · submitted <strong>together with</strong> the application</span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text">All pieces must, in principle, be <strong>performed from memory</strong></span></li>',
      /* Details: awards */
      'sec.awards': 'Awards & Prizes',
      'awards.list':
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-top">Grand Prize</span><strong>Carnegie LEE Grand Prize</strong><span class="sub">A performance opportunity at Carnegie Hall, New York (airfare & accommodation fully covered by the Foundation) · Official solo opening performance at the [Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert] · Chairman&#39;s plaque</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-top">First Prize</span><strong>Carnegie LEE First Prize</strong><span class="sub">A performance opportunity at Carnegie Hall, New York (airfare covered by the Foundation) · Official opening performance at the [Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert] · Chairman&#39;s plaque</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-top">Second Prize</span><strong>Carnegie LEE Second Prize</strong><span class="sub">A performance opportunity at Carnegie Hall, New York (airfare & accommodation at own expense) · Official opening performance at the [Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert] · Chairman&#39;s plaque</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag clf-benefit-tag-all">Ranks 1–10</span><strong>Common Benefits</strong><span class="sub">Ongoing participation in the Foundation&#39;s domestic & international cultural events with performance opportunities · A dedicated full-page profile in the official Sumi Jo concert program book · Official invitation to a private after-party reception with artists and business leaders</span></span></li>' +
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><span class="clf-benefit-tag" style="background:#FDF5F6 !important; color:#B54E3A !important; border:1px solid #F6DFE2 !important;">10 only</span><strong>Special Prize</strong><span class="sub">Mécénat Patron Award (KRW 1,000,000 each) · Scholarships (KRW 10,000,000 total)</span></span></li>',
      /* Details: special benefit */
      'sec.benefit': 'Participant Benefit',
      'benefit.callout': '<strong>A benefit for every participant! 2 tickets to the &lt;Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert&gt;</strong><br>The Foundation sponsors <strong>2 tickets</strong> to the <strong>7th Anniversary Sumi Jo Invitational Concert</strong> on Aug 11 (Tue) for <strong>every participant</strong> of this concours.',
      'awards.notice': '<strong style="color:#444;">※ Notes</strong><br>· Depending on the judging results, there may be no award recipients.<br>· Prize money is paid after tax is withheld under Korean tax law, in accordance with the prize payment agreement.',
      /* Details: video guide */
      'sec.videoguide': 'Video Filming & Submission Guide',
      'vg.intro': 'One free-choice piece. Please read the guide below, then submit your video link at the bottom of the application.',
      'vg.memo': '<strong>All pieces must, in principle, be performed from memory.</strong><br>Please choose pieces on the premise of performing without sheet music. Videos performed while reading the score may be excluded from judging.',
      'vg.acc1title': '<span class="clf-acc-icon">1</span> Filming Guide',
      'vg.acc1list':
        '<li><strong>Full-body shot required</strong> — The performer from head to feet and the entire instrument must be within the frame. (For vocalists, the full upper body and a clearly visible facial expression.)</li>' +
        '<li><strong>Identity slate</strong> — Before playing, face the camera and say aloud in your own voice <strong>“Date of birth (e.g. 020025). Name. Title of the piece. I will now begin,”</strong> then start performing.</li>' +
        '<li><strong>Single, unedited take</strong> — It must be an original recorded in one continuous take. Cut editing, multi-camera compositing, split screen, subtitles and audio correction are all <strong>prohibited</strong>.</li>' +
        '<li><strong>Fixed camera</strong> — Fixed shooting using a tripod or similar. Zoom-in, zoom-out and panning are all prohibited.</li>' +
        '<li><strong>Resolution</strong> — <code>1920×1080 (FHD)</code> or higher recommended; <code>1280×720 (HD)</code> or higher required.</li>' +
        '<li><strong>Brightness & lighting</strong> — The performer’s face and hand movements must be clearly identifiable. No backlighting.</li>' +
        '<li><strong>Recording validity</strong> — Only footage filmed on or after January 1, 2026 is accepted.</li>',
      'vg.acc2title': '<span class="clf-acc-icon">2</span> Audio Guide',
      'vg.acc2list':
        '<li><strong>Live simultaneous recording</strong> — The audio must be the original sound recorded at the same time as the video. Dubbing or post-processing by recording separately and overlaying it is prohibited.</li>' +
        '<li><strong>No audio correction</strong> — Any post-processing such as equalizer (EQ), reverb, compressor or noise gate is prohibited.</li>' +
        '<li><strong>Microphone</strong> — An external microphone is recommended. A camera’s built-in mic is accepted, but there must be no clipping (distortion).</li>' +
        '<li><strong>Ambient noise</strong> — Please ensure air-conditioner sounds, phone notifications, outside traffic noise, etc. are not included.</li>',
      'vg.acc3title': '<span class="clf-acc-icon">3</span> File Specification',
      'vg.acc3list':
        '<li><strong>Submission method</strong> — You must upload to <strong>Google Drive</strong> and submit the <strong>“share link.”</strong> <span style="color:#888;">(YouTube, Vimeo and other platforms are not allowed)</span></li>' +
        '<li><strong>File format</strong> — <code>.mp4</code> or <code>.mov</code> recommended <span style="color:#888;">(<code>.avi</code>, <code>.wmv</code>, <code>.mkv</code>, etc. are not accepted)</span></li>' +
        '<li><strong>Size limit</strong> — Up to <code>2GB</code>.</li>' +
        '<li><strong>File-name rule</strong> — <code>category_name_title.mp4</code><br><span style="color:#888;font-size:12px;">e.g. Piano_JohnSmith_Chopin Etude Op.10-4.mp4</span></li>' +
        '<li><strong>Video length</strong> — No specific limit; submit at the actual performance length (typically <strong>around 8–15 minutes</strong>).</li>' +
        '<li><strong>Sharing permission</strong> — You must change Google Drive access to <code>“Anyone with the link.”</code><div style="background: #fff0f0; border-left: 3px solid #d32f2f; padding: 10px 14px; margin-top: 8px; font-size: 13.5px; color: #d32f2f; line-height: 1.5; word-break: keep-all; border-radius: 4px;"><strong>※ Change the setting to [General access &gt; “Anyone with the link”]</strong> so that judging is possible.<br>(If the video cannot be viewed due to restricted permissions, it may be disadvantaged in judging.)</div></li>',
      'img.poster': 'poster_11_en.png'
    }
  };

  var origText = new WeakMap();
  var origHTML = new WeakMap();
  var origPH   = new WeakMap();
  var origSrc  = new WeakMap();

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
    document.querySelectorAll('[data-i18n-src]').forEach(function (el) {
      if (!origSrc.has(el)) origSrc.set(el, el.getAttribute('src') || '');
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n-src'));
      el.setAttribute('src', (t == null) ? origSrc.get(el) : t);
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
