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
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.06.01(周一) ~ 06.30(周二)</strong> 报名表·视频提交 <span style="color:#B54E3A;font-weight:700;">(截止 6.30(周二) 21:00 中国时间)</span></span></li>' +
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
      /* 성공/업로드/공지 모달 + 약관 상세 */
      'success.title': '报名已成功提交',
      'success.body': '报名表与视频已一并成功提交。<br>确认邮件将发送至您填写的邮箱。<br>登录后可在「我的页面」查看提交内容。',
      'success.ok': '确认',
      'up.title': 'Google 云端硬盘视频上传方法',
      'up.desc': '按以下步骤操作,即可生成用于评审的视频链接。',
      'up.s1': '访问 <strong>drive.google.com</strong>,使用本人 Google 账号登录。',
      'up.s2': '点击左上角 <strong>[+ 新建]</strong> → <strong>[文件上传]</strong>,选择视频文件。<br><span style="color:#888;font-size:12.5px;">文件名务必保存为 <code>组别_姓名_曲名.mp4</code> 格式。例)钢琴_张三_Chopin Etude Op.10-4.mp4</span>',
      'up.s3': '上传完成后,<strong>右键点击</strong>该文件 → 选择 <strong>[共享]</strong>。',
      'up.s4': '将 <strong>常规访问</strong> 由 <code>受限</code> 改为 <code style="color: #d32f2f; font-weight: 700;">知道链接的所有人</code>。<div style="background: #fff0f0; border-left: 3px solid #d32f2f; padding: 10px 14px; margin-top: 10px; font-size: 13.5px; color: #d32f2f; line-height: 1.5; text-align: left; word-break: keep-all; border-radius: 4px;"><strong>※ 须将设置改为 [常规访问 &gt; 知道链接的所有人]</strong> 方可评审。<br>(若因权限受限无法观看视频,可能在评审中受到不利影响。)</div>',
      'up.s5': '权限保持为 <code style="color: #d32f2f; font-weight: 700;">查看者</code>,点击右下角 <strong>[复制链接]</strong>。',
      'up.s6': '将复制的链接粘贴到 <strong>视频共享链接</strong> 输入框。<br><span style="color:#888;font-size:12.5px;">提交前请务必在隐身窗口确认能否正常播放。</span>',
      'up.close': '关闭',
      'up.openDrive': '打开 Google 云端硬盘',
      'notice.hideToday': '今天不再显示',
      'notice.close': '关闭',
      'notice.official': '<div style="text-align:center; padding-bottom:18px; border-bottom:1.5px solid #E7D9B8; margin-bottom:20px;"><img src="carnegie-lee-logo.png" alt="卡内基LEE基金会" style="height:34px; width:auto; margin-bottom:14px;"><div style="font-size:11.5px; letter-spacing:3.5px; color:#A1764B; font-weight:700; margin-bottom:9px;">OFFICIAL NOTICE</div><h2 style="margin:0 0 9px; font-size:19px; font-weight:800; color:#0C3D40; line-height:1.5;">第1届卡内基LEE基金会新人艺术家大赛<br>报名截止及后续日程公告</h2><div style="font-size:12px; color:#999; line-height:1.5;">现代版文艺复兴美第奇项目 — 纽约卡内基音乐厅 新人艺术家选拔赛</div></div><div style="font-size:13.5px; color:#444; line-height:1.8;"><p style="margin:0 0 12px;">您好,这里是卡内基LEE基金会运营事务局。</p><p style="margin:0 0 12px;">衷心感谢全国各地参赛者对第1届卡内基LEE基金会新人艺术家大赛给予的诸多关注与支持。</p><p style="margin:0 0 12px;">自<strong style="color:#0C3D40;">2026年6月30日(周二)</strong>起,报名已全部<strong style="color:#B54E3A;">截止</strong>。谨向所有参赛者致以诚挚谢意,您提交的演奏视频将依据公正、客观的标准进行评审。</p><p style="margin:0;">后续进行日程如下,敬请参阅。</p></div><div style="display:flex; align-items:center; gap:8px; margin:22px 0 12px;"><span style="width:4px; height:16px; background:#A1764B; border-radius:2px; display:inline-block;"></span><span style="font-size:15px; font-weight:800; color:#0C3D40;">后续进行日程</span></div><table style="width:100%; border-collapse:collapse; font-size:12.5px;"><thead><tr style="background:#0C3D40; color:#fff;"><th style="padding:9px 6px; text-align:center; font-weight:700; white-space:nowrap;">阶段</th><th style="padding:9px 6px; text-align:center; font-weight:700; white-space:nowrap;">日程</th><th style="padding:9px 6px; text-align:center; font-weight:700;">内容</th></tr></thead><tbody><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40; white-space:nowrap;">预选评审</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">7月1日(周三)~2日(周四)</td><td style="padding:9px 6px; color:#555;">基于提交的演奏视频进行预选评审</td></tr><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40; white-space:nowrap;">复赛入围者公布</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">7月3日(周五) 20:00</td><td style="padding:9px 6px; color:#555;">通过官方网站公布</td></tr><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40; white-space:nowrap;">复赛(现场)</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">7月13日(周一)</td><td style="padding:9px 6px; color:#555;">Marevo-in Wave · 选拔30名决赛入围者</td></tr><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40; white-space:nowrap;">决赛(现场)</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">7月16日(周四)</td><td style="padding:9px 6px; color:#555;">Marevo-in Wave · 专家+企业家联合评审</td></tr></tbody></table><div style="font-size:11.5px; color:#999; margin-top:8px;">※ 详细日程·地点·演出顺序等仅向入围者另行个别通知。</div><div style="display:flex; align-items:center; gap:8px; margin:22px 0 12px;"><span style="width:4px; height:16px; background:#A1764B; border-radius:2px; display:inline-block;"></span><span style="font-size:15px; font-weight:800; color:#0C3D40;">决赛获奖类别</span></div><div style="font-size:13px; line-height:1.5; color:#333;"><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C; margin-bottom:7px;"><strong style="color:#0C3D40;">卡内基LEE大奖</strong> (第1名) <span style="color:#A1764B; font-size:11.5px;">Grand Prize</span></div><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C; margin-bottom:7px;"><strong style="color:#0C3D40;">卡内基LEE最优秀奖</strong> (第2名) <span style="color:#A1764B; font-size:11.5px;">First Prize</span></div><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C; margin-bottom:7px;"><strong style="color:#0C3D40;">卡内基LEE优秀奖</strong> (第3名) <span style="color:#A1764B; font-size:11.5px;">Second Prize</span></div><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C;"><strong style="color:#0C3D40;">梅塞纳企业家 Pick</strong> 10位艺术家</div></div><div style="display:flex; align-items:center; gap:8px; margin:22px 0 12px;"><span style="width:4px; height:16px; background:#A1764B; border-radius:2px; display:inline-block;"></span><span style="font-size:15px; font-weight:800; color:#0C3D40;">第1~3名获奖者礼遇</span></div><div style="background:#FBF7EF; border:1px solid #E7D9B8; border-radius:10px; padding:15px 16px; font-size:13px; line-height:1.6; color:#333;"><div style="margin-bottom:8px;"><span style="color:#C9A84C;">✦</span> <strong style="color:#0C3D40;">2027年10月 纽约卡内基音乐厅</strong> 演出机会</div><div style="margin-bottom:8px;"><span style="color:#C9A84C;">✦</span> <strong style="color:#0C3D40;">成立7周年纪念 曹秀美邀请音乐会</strong> 开场演出</div><div><span style="color:#C9A84C;">✦</span> 持续参与国内外文化艺术活动</div></div><div style="background:#0C3D40; color:#fff; border-radius:12px; padding:18px; margin:22px 0;"><div style="font-size:14px; font-weight:800; color:#E7C76B; margin-bottom:9px;">卡内基LEE基金会成立7周年纪念 曹秀美邀请音乐会</div><div style="font-size:12.5px; line-height:1.7;"><strong>时间</strong> : 2026年8月11日(周二) 晚7时30分<br><strong>地点</strong> : 庆熙大学 和平殿堂 (4,500个座位)</div><div style="font-size:12.5px; line-height:1.6; color:rgba(255,255,255,0.85); margin-top:9px;">大赛获奖艺术家将登上世界级女高音曹秀美邀请音乐会的正式开场舞台。</div></div><p style="margin:0 0 6px; font-size:13.5px; color:#444; line-height:1.8;">卡内基LEE基金会希望通过本次大赛发掘具备卓越实力的新一代古典艺术家,实现企业与艺术共同成长的‘现代版文艺复兴美第奇项目’的价值。再次向所有参赛艺术家致以深深谢意,我们将竭尽全力,通过公正透明的评审为您呈现优异的结果。今后也恳请您一如既往地关注与支持卡内基LEE基金会的发展。谢谢。</p><div style="text-align:center; margin:22px 0 6px;"><div style="font-weight:800; color:#0C3D40; font-size:15px;">卡内基LEE基金会</div><div style="font-size:12.5px; color:#888; margin-top:2px;">运营事务局</div></div><div style="background:#0C3D40; color:rgba(255,255,255,0.85); border-radius:8px; padding:11px 14px; margin-top:18px; font-size:11px; line-height:1.6; text-align:center;">Carnegie LEE Foundation | carnegielee.com<br>☎ 1588-8418 | info@carnegielee.org</div>',
      /* 마감 배너 / 마감 후 로그인 패널 / 마이페이지 / title */
      'page.title': '2026古典音乐比赛 报名 - Carnegie LEE Foundation',
      'closeBanner.title': '报名已截止',
      'closeBanner.desc': '衷心感谢您的热情关注与支持 🙏',
      'auth.extNotice': '<strong style="display:block; margin-bottom:5px; color:#B54E3A;">📢 报名截止时间延长通知</strong>由于报名·视频上传集中在截止时间,为保障顺利报名,截止时间延长至<strong>今日(周二)21:00(中国时间)</strong>。<br>延长报名仅限<strong>今日17:00(中国时间)前完成注册的会员</strong>,新会员注册已结束。<br><span style="color:#B54E3A;">※ 21:00(中国时间)之后系统将自动关闭,无法补充报名。</span>',
      'notice.extension': '<div style="display:inline-block; background:#B54E3A; color:#fff; font-size:12.5px; font-weight:700; padding:5px 13px; border-radius:20px; margin-bottom:12px;">📢 报名截止延长</div><h2 style="margin:0 0 12px; font-size:21px; font-weight:800; color:#B54E3A; line-height:1.4;">报名截止时间已延长至<br>今日 21:00(中国时间)</h2><p style="margin:0 0 10px; font-size:14.5px; color:#444; line-height:1.65;">由于报名·视频上传集中在截止时间,为保障顺利报名,截止时间延长至<strong style="color:#B54E3A;">今日(周二)21:00(中国时间)</strong>。</p><p style="margin:0; font-size:13.5px; color:#666; line-height:1.65;">延长报名仅限<strong>今日17:00(中国时间)前完成注册的会员</strong>,新会员注册已结束。<br><span style="color:#B54E3A;">※ 21:00(中国时间)之后系统将自动关闭,无法补充报名。</span></p>',
      'auth.loginTitle': '🔑 登录',
      'auth.loginSub': '使用提交材料时注册的邮箱与密码登录,<br>即可查看已提交的材料并提交视频。',
      'auth.loginBtn': '登录',
      'auth.noSubmit': '还没有提交材料?',
      'auth.register': '注册',
      'auth.regTitle': '📋 注册',
      'auth.regSub': '提交材料前请先创建账号。<br>提交后可随时登录查看内容。',
      'auth.pwConfirm': '确认密码',
      'auth.regBtn': '注册',
      'auth.haveAccount': '已有账号?',
      'auth.login': '登录',
      'auth.emailSentOk': '确认(前往登录)',
      'auth.forgotPw': '忘记密码?',
      'myPage.sub': '已提交的材料无法修改。',
      'myPage.logout': '退出登录',
      'form.agree1Detail': '<strong style="color:#0C3D40 !important;">▸ 收集项目</strong><br>姓名、出生年月日、性别、联系方式、邮箱、学校名称·专业、活动经历、获奖经历、了解渠道、演奏视频、证件照<br><br><strong style="color:#0C3D40 !important;">▸ 收集·使用目的</strong><br>用于本次比赛的参赛者识别、评审、获奖公布、颁奖及运营相关通知<br><br><strong style="color:#0C3D40 !important;">▸ 保存及使用期限</strong><br>比赛结束后保存3年后销毁(依据相关法令负有保存义务的,在该期限内保存)<br><br><strong style="color:#0C3D40 !important;">▸ 拒绝同意的权利</strong><br>您有权拒绝本个人信息的收集·使用;拒绝同意将无法参加比赛。',
      'form.agree2Detail': '<strong style="color:#0C3D40 !important;">▸ 著作权归属</strong><br>所提交全部演奏视频的原著作权归<strong>参赛者本人</strong>所有。<br><br><strong style="color:#0C3D40 !important;">▸ 基金会使用权范围</strong><br>主办·承办方(卡内基LEE基金会)仅在活动对外宣传、决赛舞台记录视频制作、基金会社交媒体·官网发布、画册·媒体报道等<strong>非营利活动运营及宣传目的</strong>范围内,合法使用参赛者的视频·照片。<br><br><strong style="color:#0C3D40 !important;">▸ 决赛舞台拍摄</strong><br>决赛入围者同意其决赛舞台演出的视频·照片可用于活动记录及今后的宣传资料。',
      'form.agree3Detail': '<strong style="color:#0C3D40 !important;">▸ 同意范围</strong><br>同意使用在决赛舞台、彩排等活动现场拍摄的本人照片·视频。<br><br><strong style="color:#0C3D40 !important;">▸ 使用媒介</strong><br>基金会官网·社交媒体、新闻稿、画册、影像记录、今后基金会活动宣传物等。',
      'form.agree4Detail': '本人充分知悉并同意:已缴纳的<strong>报名费(100,000韩元)</strong>不因任何理由退还。缴纳报名费后,比赛报名即正式完成。',
      'form.agree5Detail': '同意通过邮件·短信接收今后卡内基LEE基金会的征集·音乐会·展览等活动通知及简讯。拒绝时将不再发送营销信息,但本次比赛的运营通知邮件仍会正常发送。',
      'img.poster': 'poster_13_zh.png',
      'pdf.guideline': 'guideline_zh.pdf',
      'pdf.guidelineTitle': '卡内基LEE财团 古典音乐比赛 招募简章.pdf',
      'img.posterTitle': '卡内基LEE财团 古典音乐比赛 海报.png',
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
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-benefit-tag" style="background:#FDF5F6 !important; color:#B54E3A !important; border:1px solid #F6DFE2 !important;">限10名</span><strong>特别奖</strong><span class="sub">麦塞纳企业家奖(每人1,000,000韩元)· 发放奖学金(共10,000,000韩元)</span></span></li>',
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
      /* ── 신청서 폼 ── */
      'form.introko': '报名表',
      'form.introdesc': '请准确填写以下各项,并在底部一并提交<strong>演奏视频共享链接</strong>。报名表与视频一次性提交。(报名截止:6/30(周二) 21:00 中国时间)',
      'form.acctCallout': '<strong>需创建登录账号</strong><br>提交后可在「我的页面」查看提交内容。请务必牢记邮箱与密码。',
      'form.secAccount': '账号设置',
      'form.acctDesc': '请设置用于登录的邮箱与密码。(可与下方「参赛者信息」中的邮箱相同)',
      'form.acctEmail': '账号邮箱 <span class="clf-req">*</span>',
      'form.acctPw': '设置密码 <span class="clf-req">*</span>',
      'ph.acctPw': '6位以上(建议字母+数字)',
      'form.secCategory': '参赛组别',
      'form.divLabel': '比赛分类 <span class="clf-req">*</span>',
      'form.divInstrumental': '器乐 (Instrumental)',
      'form.divVocal': '声乐 (Vocal)',
      'form.instLabel': '具体乐器 <span class="clf-req">*</span>',
      'form.selPlaceholder': '— 请选择 —',
      'form.selPick': '— 请选择 —',
      'form.ogKeyboard': '键盘', 'form.ogStrings': '弦乐', 'form.ogWoodwind': '木管', 'form.ogBrass': '铜管', 'form.ogPercussion': '打击乐',
      'inst.piano': '钢琴 (Piano)', 'inst.organ': '管风琴 (Organ)', 'inst.harpsichord': '羽管键琴 (Harpsichord)',
      'inst.violin': '小提琴 (Violin)', 'inst.viola': '中提琴 (Viola)', 'inst.cello': '大提琴 (Cello)', 'inst.bass': '低音提琴 (Double Bass)', 'inst.harp': '竖琴 (Harp)', 'inst.guitar': '古典吉他 (Classical Guitar)',
      'inst.flute': '长笛 (Flute)', 'inst.oboe': '双簧管 (Oboe)', 'inst.clarinet': '单簧管 (Clarinet)', 'inst.bassoon': '大管 (Bassoon)', 'inst.sax': '萨克斯 (Saxophone)',
      'inst.horn': '圆号 (Horn)', 'inst.trumpet': '小号 (Trumpet)', 'inst.trombone': '长号 (Trombone)', 'inst.tuba': '大号 (Tuba)',
      'inst.marimba': '马林巴 (Marimba)', 'inst.timpani': '定音鼓 (Timpani)', 'inst.percussion': '打击乐 (Percussion)',
      'inst.chamber': '室内乐 (Chamber Music)', 'opt.etcInput': '其他(直接填写)',
      'ph.instEtc': '请填写具体乐器',
      'form.vocalGenre': '专业体裁',
      'voc.opera': '歌剧·咏叹调', 'voc.lied': '德国艺术歌曲 (Lied)', 'voc.korean': '韩国艺术歌曲', 'voc.oratorio': '清唱剧·宗教音乐',
      'ph.vocalEtc': '请填写专业体裁',
      'form.secParticipant': '参赛者信息',
      'form.profilePhoto': '本人确认用证件照(正面) <span class="clf-req">*</span>',
      'form.profileHelp': '用手机拍摄的正面照片亦可。(用于本人确认)',
      'form.idDoc': '证明文件(护照或身份证复印件) <span class="clf-req">*</span>',
      'form.idDocHelp': '用于确认出生年月日等身份的证明文件图片。<strong style="color:#B54E3A;">※ 韩国身份证后7位号码请务必遮挡后再提交。</strong>',
      'form.nameKo': '姓名 <span class="clf-req">*</span>',
      'form.birth': '出生年月日 <span class="clf-req">*</span>',
      'form.ageConfirm': '年龄确认 <span class="clf-req">*</span>',
      'form.ageOver14': '满14周岁以上', 'form.ageUnder14': '未满14周岁',
      'form.guardianNote': '※ 未满14周岁的参赛者需法定代理人同意。',
      'form.guardianConsent': '本人作为未满14周岁参赛者的法定代理人,同意其参加卡内基LEE基金会第一届比赛及个人信息的收集·使用。 <span class="clf-req">*</span>',
      'form.guardianName': '法定代理人姓名 <span class="clf-req">*</span>',
      'form.guardianRelation': '与参赛者关系 <span class="clf-req">*</span>',
      'ph.guardianRelation': '父、母等',
      'form.guardianPhone': '联系电话 <span class="clf-req">*</span>',
      'form.gender': '性别', 'form.genderF': '女', 'form.genderM': '男', 'form.genderNA': '不填写',
      'form.phone': '手机号码 <span class="clf-req">*</span>',
      'form.email': '邮箱 <span class="clf-req">*</span>',
      'form.addrCity': '地址(省·市) <span class="clf-req">*</span>',
      'form.addrCityPh': '— 选择省·市 —',
      'form.addrDistrict': '地址(区·县) <span class="clf-req">*</span>',
      'form.addrDistrictPh': '— 选择区·县 —',
      'form.secEducation': '学历·经历·获奖',
      'form.schoolName': '学校名称·专业 <span class="clf-req">*</span>',
      'ph.schoolName': '例)首尔大学音乐学院 钢琴专业',
      'form.career': '活动经历(所属团体·舞台经历) <span class="clf-req">*</span>',
      'ph.career': '• 2025~至今 OOO 乐团客席团员&#10;• 2024 OOO 音乐节独奏协演&#10;• ...',
      'form.careerHelp': '现役艺术家可填写主要舞台·所属·活动;备考生可填写目前的授课老师等。',
      'form.awardsField': '主要获奖经历 <span class="clf-req">*</span>',
      'ph.awardsField': '• 2025 OOO 比赛第1名&#10;• 2024 OOO 国际比赛获奖&#10;• 无获奖经历请填写「无」',
      'form.secVideo': '演奏视频提交',
      'form.videoDesc': '自选曲目1首。请务必参阅上方<strong>视频拍摄·提交指南</strong>后再填写共享链接。',
      'form.fnGuideLabel': '视频文件命名规则',
      'form.fnGuideEx': '例)钢琴_张三_Chopin Etude Op.10-4.mp4 · 项目之间用下划线(_)连接',
      'form.howToUpload': '了解上传方法',
      'btn.goDrive': '打开 Google 云盘',
      'form.fnRuleFormat': '组别_姓名_曲名.mp4',
      'form.fnRuleFormatEx': '例)钢琴_张三_Chopin Etude Op.10-4.mp4',
      'form.helpLink': '什么是 Google Drive 共享链接？',
      'form.videoLink': '视频共享链接 <span class="clf-req">*</span>',
      'form.videoLinkHelp': '提交前请务必在<strong style="color:#0C3D40;">隐身(未登录)窗口中确认链接能否正常打开</strong>。',
      'form.vComposer': '曲目作曲家 <span class="clf-req">*</span>',
      'ph.vComposer': '例)F. Chopin',
      'form.vPiece': '曲目名称 <span class="clf-req">*</span>',
      'ph.vPiece': '例)Etude Op.10 No.4',
      'form.secReferral': '了解渠道',
      'form.referralDesc': '您是通过何种渠道得知本次比赛的?将作为今后通知的参考。',
      'form.referralLabel': '了解渠道 <span class="clf-req">*</span>',
      'ref.web': '卡内基Lee基金会官方网站', 'ref.sns': '基金会社交媒体(Instagram·Facebook 等)', 'ref.youtube': 'YouTube 视频·广告', 'ref.search': 'Naver·Google 等搜索', 'ref.community': '音乐相关社区·论坛', 'ref.school': '学校·培训机构通知', 'ref.professor': '指导教授·老师推荐', 'ref.friend': '熟人·同行推荐', 'ref.press': '媒体报道·新闻', 'ref.poster': '海报·传单',
      'ph.referralEtc': '请填写您了解本次比赛的渠道',
      'form.secPayment': '报名费说明',
      'form.payDesc': '提交材料后,请向以下账户缴纳报名费。',
      'form.payFeeSub': '所有提交者均须缴纳',
      'form.payUnit': '韩元 / 每人',
      'form.payDeadlineLabel': '缴费截止',
      'form.paySub2': '仅限银行转账',
      'form.payDeadlineDate': '2026.06.30(周二) 21:00 中国时间',
      'form.payNote1': '<strong class="clf-warn">⚠ 不可退款说明</strong><br>已缴纳的<strong>报名费在任何情况下均不退还。</strong>请慎重缴纳。<br><br><span style="font-size:16px; color:#B54E3A; font-weight:700;">汇款时务必采用 [콩+出生年月日6位+姓名] 的格式。</span><br><span style="font-size:15px; color:#0C3D40; font-weight:700;">(例:콩020312洪吉童)</span>',
      'form.payNote2': '<strong style="color:#0C3D40 !important;">▸ 报名确认说明</strong><br>须同时确认材料·视频提交与<strong>报名费缴纳后,比赛报名方正式完成</strong>。<br><span style="color: #d32f2f; font-weight: 700;">※ 汇款人姓名务必采用 [콩+出生年月日6位+姓名] 格式,以便快速确认。</span>',
      'form.secAgreement': '条款同意',
      'form.agreeAll': '<strong>同意全部条款</strong><span class="clf-agree-master-sub">一并同意4项必填与1项选填。</span>',
      'form.agree1Label': '<strong>[必填] <span class="clf-req">*</span> 同意个人信息的收集·使用</strong>',
      'form.agree2Label': '<strong>[必填] <span class="clf-req">*</span> 同意演奏视频及内容的使用权</strong>',
      'form.agree3Label': '<strong>[必填] <span class="clf-req">*</span> 同意肖像权使用</strong>',
      'form.agree4Label': '<strong>[必填] <span class="clf-req">*</span> 同意报名费不可退款规定</strong>',
      'form.agree5Label': '<span class="clf-agree-optional-tag">选填</span><strong>同意接收营销信息</strong>',
      'form.submitBtn': '提交报名表',
      'form.submitHint': '提交后,确认邮件将发送至您填写的邮箱。',
      'form.footerInquiry': '<strong>[咨询] 卡内基LEE基金会事务局</strong><br>电话:<a href="tel:1588-8418" style="color:#0C3D40; text-decoration:none; font-weight:700;">1588-8418</a><br>邮箱:<a href="mailto:info@carnegielee.org" style="color:#0C3D40; text-decoration:none; font-weight:700;">info@carnegielee.org</a><br>咨询时间:10:00 ~ 18:00',
      'img.poster': 'poster_13_zh.png',
      'form.fileChoose': '选择文件',
      'form.fileNoChosen': '未选择文件'
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
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-detail-text"><strong>2026.06.01 (Mon) – 06.30 (Tue)</strong> Application &amp; video submission <span style="color:#B54E3A;font-weight:700;">(deadline Jun 30 (Tue) 09:00, New York / EDT)</span></span></li>' +
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
      /* Success / upload / notice modals + agreement details */
      'success.title': 'Your application has been received',
      'success.body': 'Your application and video have been submitted successfully.<br>A confirmation email will be sent to the address you entered.<br>After logging in, you can review your submission on My Page.',
      'success.ok': 'OK',
      'up.title': 'How to upload your video to Google Drive',
      'up.desc': 'Follow the steps below to create a video link for judging.',
      'up.s1': 'Go to <strong>drive.google.com</strong> and log in with your Google account.',
      'up.s2': 'Click <strong>[+ New]</strong> → <strong>[File upload]</strong> at the top left and select your video file.<br><span style="color:#888;font-size:12.5px;">Save the file name in the format <code>category_name_title.mp4</code>. e.g. Piano_JohnDoe_Chopin Etude Op.10-4.mp4</span>',
      'up.s3': 'When the upload is finished, <strong>right-click</strong> the file → choose <strong>[Share]</strong>.',
      'up.s4': 'Change <strong>General access</strong> from <code>Restricted</code> to <code style="color: #d32f2f; font-weight: 700;">Anyone with the link</code>.<div style="background: #fff0f0; border-left: 3px solid #d32f2f; padding: 10px 14px; margin-top: 10px; font-size: 13.5px; color: #d32f2f; line-height: 1.5; text-align: left; word-break: keep-all; border-radius: 4px;"><strong>※ You must change the setting to [General access &gt; Anyone with the link]</strong> for judging to be possible.<br>(If the video cannot be viewed due to restricted permissions, it may be disadvantaged in judging.)</div>',
      'up.s5': 'Keep the permission as <code style="color: #d32f2f; font-weight: 700;">Viewer</code> and click <strong>[Copy link]</strong> at the bottom right.',
      'up.s6': 'Paste the copied link into the <strong>Video share link</strong> field.<br><span style="color:#888;font-size:12.5px;">Before submitting, make sure it plays in an incognito window.</span>',
      'up.close': 'Close',
      'up.openDrive': 'Open Google Drive',
      'notice.hideToday': 'Don’t show again today',
      'notice.close': 'Close',
      'notice.official': '<div style="text-align:center; padding-bottom:18px; border-bottom:1.5px solid #E7D9B8; margin-bottom:20px;"><img src="carnegie-lee-logo.png" alt="Carnegie LEE Foundation" style="height:34px; width:auto; margin-bottom:14px;"><div style="font-size:11.5px; letter-spacing:3.5px; color:#A1764B; font-weight:700; margin-bottom:9px;">OFFICIAL NOTICE</div><h2 style="margin:0 0 9px; font-size:18px; font-weight:800; color:#0C3D40; line-height:1.45;">1st Carnegie LEE Foundation New Artist Concours<br>Close of Applications &amp; Upcoming Schedule</h2><div style="font-size:12px; color:#999; line-height:1.5;">A Modern-Day Renaissance Medici Project — New York Carnegie Hall New Artist Selection</div></div><div style="font-size:13.5px; color:#444; line-height:1.75;"><p style="margin:0 0 12px;">Hello. This is the Carnegie LEE Foundation Operations Office.</p><p style="margin:0 0 12px;">We sincerely thank all applicants nationwide for the tremendous interest and support shown to the 1st Carnegie LEE Foundation New Artist Concours.</p><p style="margin:0 0 12px;">As of <strong style="color:#0C3D40;">Tuesday, June 30, 2026</strong>, applications have been fully <strong style="color:#B54E3A;">closed</strong>. We are deeply grateful to everyone who applied; the performance videos you submitted will be judged by fair and objective standards.</p><p style="margin:0;">Please see the upcoming schedule below.</p></div><div style="display:flex; align-items:center; gap:8px; margin:22px 0 12px;"><span style="width:4px; height:16px; background:#A1764B; border-radius:2px; display:inline-block;"></span><span style="font-size:15px; font-weight:800; color:#0C3D40;">Upcoming Schedule</span></div><table style="width:100%; border-collapse:collapse; font-size:12px;"><thead><tr style="background:#0C3D40; color:#fff;"><th style="padding:9px 6px; text-align:center; font-weight:700; white-space:nowrap;">Stage</th><th style="padding:9px 6px; text-align:center; font-weight:700; white-space:nowrap;">Date</th><th style="padding:9px 6px; text-align:center; font-weight:700;">Details</th></tr></thead><tbody><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40;">Preliminary</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">Jul 1 (Wed)–2 (Thu)</td><td style="padding:9px 6px; color:#555;">Preliminary screening based on submitted videos</td></tr><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40;">Main-Round Qualifiers</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">Jul 3 (Fri) 20:00</td><td style="padding:9px 6px; color:#555;">Announced via the official website</td></tr><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40; white-space:nowrap;">Main Round</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">Jul 13 (Mon)</td><td style="padding:9px 6px; color:#555;">Marevo-in Wave · 30 finalists selected</td></tr><tr style="border-bottom:1px solid #EEE;"><td style="padding:9px 6px; text-align:center; font-weight:700; color:#0C3D40; white-space:nowrap;">Final Round</td><td style="padding:9px 6px; text-align:center; white-space:nowrap;">Jul 16 (Thu)</td><td style="padding:9px 6px; color:#555;">Marevo-in Wave · joint judging by experts &amp; business leaders</td></tr></tbody></table><div style="font-size:11.5px; color:#999; margin-top:8px;">※ The detailed schedule, venue, and performance order will be announced individually to qualifiers only.</div><div style="display:flex; align-items:center; gap:8px; margin:22px 0 12px;"><span style="width:4px; height:16px; background:#A1764B; border-radius:2px; display:inline-block;"></span><span style="font-size:15px; font-weight:800; color:#0C3D40;">Final-Round Award Categories</span></div><div style="font-size:13px; line-height:1.5; color:#333;"><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C; margin-bottom:7px;"><strong style="color:#0C3D40;">Carnegie LEE Grand Prize</strong> <span style="color:#A1764B; font-size:11.5px;">— 1st Place</span></div><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C; margin-bottom:7px;"><strong style="color:#0C3D40;">Carnegie LEE First Prize</strong> <span style="color:#A1764B; font-size:11.5px;">— 2nd Place</span></div><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C; margin-bottom:7px;"><strong style="color:#0C3D40;">Carnegie LEE Second Prize</strong> <span style="color:#A1764B; font-size:11.5px;">— 3rd Place</span></div><div style="padding:6px 0 6px 12px; border-left:3px solid #C9A84C;"><strong style="color:#0C3D40;">Mécénat Patrons&#39; Pick</strong> — 10 Artists</div></div><div style="display:flex; align-items:center; gap:8px; margin:22px 0 12px;"><span style="width:4px; height:16px; background:#A1764B; border-radius:2px; display:inline-block;"></span><span style="font-size:15px; font-weight:800; color:#0C3D40;">Benefits for 1st–3rd Place Winners</span></div><div style="background:#FBF7EF; border:1px solid #E7D9B8; border-radius:10px; padding:15px 16px; font-size:13px; line-height:1.5; color:#333;"><div style="margin-bottom:8px;"><span style="color:#C9A84C;">✦</span> A performance opportunity at <strong style="color:#0C3D40;">Carnegie Hall, New York in October 2027</strong></div><div style="margin-bottom:8px;"><span style="color:#C9A84C;">✦</span> Official opening performance at the <strong style="color:#0C3D40;">7th Anniversary Sumi Jo Invitational Concert</strong></div><div><span style="color:#C9A84C;">✦</span> Ongoing participation in domestic &amp; international arts &amp; culture events</div></div><div style="background:#0C3D40; color:#fff; border-radius:12px; padding:18px; margin:22px 0;"><div style="font-size:14px; font-weight:800; color:#E7C76B; margin-bottom:9px;">Carnegie LEE Foundation 7th Anniversary — Sumi Jo Invitational Concert</div><div style="font-size:12.5px; line-height:1.7;"><strong>Date</strong> : Tuesday, August 11, 2026, 7:30 PM<br><strong>Venue</strong> : Grand Peace Palace, Kyung Hee University (4,500 seats)</div><div style="font-size:12.5px; line-height:1.6; color:rgba(255,255,255,0.85); margin-top:9px;">Award-winning artists will take the official opening stage of world-renowned soprano Sumi Jo&#39;s invitational concert.</div></div><p style="margin:0 0 6px; font-size:13.5px; color:#444; line-height:1.75;">Through this concours, the Carnegie LEE Foundation seeks to discover outstanding next-generation classical artists and to realize the value of the &#39;Modern-Day Renaissance Medici Project,&#39; in which business and the arts grow together. We once again sincerely thank all participating artists, and we will do our utmost to deliver good results through fair and transparent judging. We kindly ask for your continued interest and support in the journey ahead. Thank you.</p><div style="text-align:center; margin:22px 0 6px;"><div style="font-weight:800; color:#0C3D40; font-size:15px;">Carnegie LEE Foundation</div><div style="font-size:12.5px; color:#888; margin-top:2px;">Operations Office</div></div><div style="background:#0C3D40; color:rgba(255,255,255,0.85); border-radius:8px; padding:11px 14px; margin-top:18px; font-size:11px; line-height:1.6; text-align:center;">Carnegie LEE Foundation | carnegielee.com<br>☎ 1588-8418 | info@carnegielee.org</div>',
      /* Closed banner / post-deadline auth panel / My Page / title */
      'page.title': '2026 Classical Concours Application - Carnegie LEE Foundation',
      'closeBanner.title': 'Applications are closed',
      'closeBanner.desc': 'Thank you sincerely for your wonderful interest and support 🙏',
      'auth.extNotice': '<strong style="display:block; margin-bottom:5px; color:#B54E3A;">📢 Application Deadline Extended</strong>As submissions and video uploads concentrated near the deadline, the deadline has been extended to <strong>today (Tue) 09:00 (New York/EDT)</strong> for smoother processing.<br>Extended applications are limited to <strong>members who registered before 05:00 (New York/EDT) today</strong>; new sign-ups are now closed.<br><span style="color:#B54E3A;">※ After 09:00 (New York/EDT), the system closes automatically and no further applications can be submitted.</span>',
      'notice.extension': '<div style="display:inline-block; background:#B54E3A; color:#fff; font-size:12.5px; font-weight:700; padding:5px 13px; border-radius:20px; margin-bottom:12px;">📢 Deadline Extended</div><h2 style="margin:0 0 12px; font-size:21px; font-weight:800; color:#B54E3A; line-height:1.4;">The application deadline is extended to<br>today 09:00 (New York/EDT)</h2><p style="margin:0 0 10px; font-size:14.5px; color:#444; line-height:1.65;">As submissions and video uploads concentrated near the deadline, the deadline has been extended to <strong style="color:#B54E3A;">today (Tue) 09:00 (New York/EDT)</strong> for smoother processing.</p><p style="margin:0; font-size:13.5px; color:#666; line-height:1.65;">Extended applications are limited to <strong>members who registered before 05:00 (New York/EDT) today</strong>; new sign-ups are now closed.<br><span style="color:#B54E3A;">※ After 09:00 (New York/EDT), the system closes automatically and no further applications can be submitted.</span></p>',
      'auth.loginTitle': '🔑 Log in',
      'auth.loginSub': 'Log in with the email and password you registered when submitting<br>to review your submission and upload your video.',
      'auth.loginBtn': 'Log in',
      'auth.noSubmit': "Haven't submitted yet?",
      'auth.register': 'Sign up',
      'auth.regTitle': '📋 Sign up',
      'auth.regSub': 'Create an account before submitting.<br>You can log in anytime afterward to review your content.',
      'auth.pwConfirm': 'Confirm password',
      'auth.regBtn': 'Sign up',
      'auth.haveAccount': 'Already have an account?',
      'auth.login': 'Log in',
      'auth.emailSentOk': 'OK (go to login)',
      'auth.forgotPw': 'Forgot your password?',
      'myPage.sub': 'Submitted documents cannot be edited.',
      'myPage.logout': 'Log out',
      'form.agree1Detail': '<strong style="color:#0C3D40 !important;">▸ Items collected</strong><br>Name, date of birth, gender, contact, email, school & major, career, awards, referral source, performance video, profile photo<br><br><strong style="color:#0C3D40 !important;">▸ Purpose of collection & use</strong><br>Identifying participants, judging, announcing winners, awards, and operational notices for this concours<br><br><strong style="color:#0C3D40 !important;">▸ Retention & use period</strong><br>Retained for 3 years after the concours ends, then destroyed (kept for the required period where retention is mandated by law)<br><br><strong style="color:#0C3D40 !important;">▸ Right to refuse</strong><br>You may refuse consent to this collection & use of personal information; if you refuse, you cannot participate.',
      'form.agree2Detail': '<strong style="color:#0C3D40 !important;">▸ Copyright ownership</strong><br>The original copyright of all submitted performance videos belongs to <strong>the participant</strong>.<br><br><strong style="color:#0C3D40 !important;">▸ Scope of the Foundation’s usage rights</strong><br>The organizer (Carnegie LEE Foundation) may lawfully use participants’ videos/photos only for <strong>non-profit event operation and promotion</strong> — external promotion, production of final-stage record videos, posting on the Foundation’s social media/website, catalogs, press, etc.<br><br><strong style="color:#0C3D40 !important;">▸ Final-stage filming</strong><br>Finalists agree that videos/photos of their final-stage performance may be used as event records and for future promotional materials.',
      'form.agree3Detail': '<strong style="color:#0C3D40 !important;">▸ Scope of consent</strong><br>I consent to the use of my photos/videos taken at the event (final stage, rehearsals, etc.).<br><br><strong style="color:#0C3D40 !important;">▸ Media used</strong><br>The Foundation’s official website/social media, press releases, catalogs, video records, future event promotion materials, etc.',
      'form.agree4Detail': 'I fully understand and agree that the <strong>participation fee (KRW 100,000)</strong>, once paid, is not refunded for any reason. Your entry is officially complete upon payment of the fee.',
      'form.agree5Detail': 'I agree to receive notices and newsletters about the Carnegie LEE Foundation’s future competitions, concerts, exhibitions, etc. by email/SMS. If you decline, marketing information will not be sent, but operational notice emails for this concours will still be sent.',
      'img.poster': 'poster_11_en.png',
      'pdf.guideline': 'guideline_en.pdf',
      'pdf.guidelineTitle': 'Carnegie LEE Foundation Classic Concours Guidelines.pdf',
      'img.posterTitle': 'Carnegie LEE Foundation Classic Concours Poster.png',
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
        '<li class="clf-detail-item"><span class="clf-detail-dot"></span><span class="clf-benefit-tag" style="background:#FDF5F6 !important; color:#B54E3A !important; border:1px solid #F6DFE2 !important;">10 only</span><strong>Special Prize</strong><span class="sub">Mécénat Patron Award (KRW 1,000,000 each) · Scholarships (KRW 10,000,000 total)</span></span></li>',
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
      /* ── Application form ── */
      'form.introko': 'Application Form',
      'form.introdesc': 'Please fill in the items below accurately and submit your <strong>performance video share link</strong> at the bottom. The application and video are submitted together. (Deadline: Jun 30 (Tue) 09:00 New York/EDT)',
      'form.acctCallout': '<strong>A login account is required</strong><br>After submitting, you can review your submission on My Page. Please remember your email and password.',
      'form.secAccount': 'Account Setup',
      'form.acctDesc': 'Set the email and password you will use to log in. (You may use the same email as in the Participant Information below.)',
      'form.acctEmail': 'Account email <span class="clf-req">*</span>',
      'form.acctPw': 'Set password <span class="clf-req">*</span>',
      'ph.acctPw': '6+ chars (letters & numbers recommended)',
      'form.secCategory': 'Category',
      'form.divLabel': 'Competition field <span class="clf-req">*</span>',
      'form.divInstrumental': 'Instrumental',
      'form.divVocal': 'Vocal',
      'form.instLabel': 'Instrument <span class="clf-req">*</span>',
      'form.selPlaceholder': '— Please select —',
      'form.selPick': '— Select —',
      'form.ogKeyboard': 'Keyboard', 'form.ogStrings': 'Strings', 'form.ogWoodwind': 'Woodwind', 'form.ogBrass': 'Brass', 'form.ogPercussion': 'Percussion',
      'inst.piano': 'Piano', 'inst.organ': 'Organ', 'inst.harpsichord': 'Harpsichord',
      'inst.violin': 'Violin', 'inst.viola': 'Viola', 'inst.cello': 'Cello', 'inst.bass': 'Double Bass', 'inst.harp': 'Harp', 'inst.guitar': 'Classical Guitar',
      'inst.flute': 'Flute', 'inst.oboe': 'Oboe', 'inst.clarinet': 'Clarinet', 'inst.bassoon': 'Bassoon', 'inst.sax': 'Saxophone',
      'inst.horn': 'Horn', 'inst.trumpet': 'Trumpet', 'inst.trombone': 'Trombone', 'inst.tuba': 'Tuba',
      'inst.marimba': 'Marimba', 'inst.timpani': 'Timpani', 'inst.percussion': 'Percussion',
      'inst.chamber': 'Chamber Music', 'opt.etcInput': 'Other (enter manually)',
      'ph.instEtc': 'Enter your instrument',
      'form.vocalGenre': 'Genre',
      'voc.opera': 'Opera & Aria', 'voc.lied': 'German Lied', 'voc.korean': 'Korean Art Song', 'voc.oratorio': 'Oratorio & Sacred Music',
      'ph.vocalEtc': 'Enter your genre',
      'form.secParticipant': 'Participant',
      'form.profilePhoto': 'Profile photo for ID (front) <span class="clf-req">*</span>',
      'form.profileHelp': 'A front-facing photo taken with a smartphone is fine. (for identity check)',
      'form.idDoc': 'ID document (passport or ID-card copy) <span class="clf-req">*</span>',
      'form.idDocHelp': 'An image of an ID document confirming your date of birth, etc. <strong style="color:#B54E3A;">※ For a Korean ID card, mask the last 7 digits before submitting.</strong>',
      'form.nameKo': 'Name <span class="clf-req">*</span>',
      'form.birth': 'Date of birth <span class="clf-req">*</span>',
      'form.ageConfirm': 'Age confirmation <span class="clf-req">*</span>',
      'form.ageOver14': '14 or older', 'form.ageUnder14': 'Under 14',
      'form.guardianNote': '※ Participants under 14 require legal-guardian consent.',
      'form.guardianConsent': 'As the legal guardian of a participant under 14, I consent to their participation in the Carnegie LEE Foundation 1st Concours and to the collection & use of personal information. <span class="clf-req">*</span>',
      'form.guardianName': 'Guardian name <span class="clf-req">*</span>',
      'form.guardianRelation': 'Relationship <span class="clf-req">*</span>',
      'ph.guardianRelation': 'e.g. father, mother',
      'form.guardianPhone': 'Phone <span class="clf-req">*</span>',
      'form.gender': 'Gender', 'form.genderF': 'Female', 'form.genderM': 'Male', 'form.genderNA': 'Prefer not to say',
      'form.phone': 'Mobile phone <span class="clf-req">*</span>',
      'form.email': 'Email <span class="clf-req">*</span>',
      'form.addrCity': 'Address (Province/City) <span class="clf-req">*</span>',
      'form.addrCityPh': '— Select province/city —',
      'form.addrDistrict': 'Address (District) <span class="clf-req">*</span>',
      'form.addrDistrictPh': '— Select district —',
      'form.secEducation': 'Education · Career · Awards',
      'form.schoolName': 'School & major <span class="clf-req">*</span>',
      'ph.schoolName': 'e.g. Seoul National Univ., Piano major',
      'form.career': 'Career (affiliations · stage experience) <span class="clf-req">*</span>',
      'ph.career': '• 2025–present, guest member of OOO Orchestra&#10;• 2024, soloist at OOO Festival&#10;• ...',
      'form.careerHelp': 'Active artists may list major performances/affiliations; students may list their current teacher, etc.',
      'form.awardsField': 'Major awards <span class="clf-req">*</span>',
      'ph.awardsField': '• 2025, 1st place at OOO Competition&#10;• 2024, prize at OOO International Competition&#10;• If none, write “None”',
      'form.secVideo': 'Performance Video',
      'form.videoDesc': 'One free-choice piece. Please read the <strong>Video Filming & Submission Guide</strong> above, then enter your share link.',
      'form.fnGuideLabel': 'Video File Naming Rule',
      'form.fnGuideEx': 'e.g. Piano_JohnDoe_Chopin Etude Op.10-4.mp4 · Connect items with an underscore (_)',
      'form.howToUpload': 'How to upload',
      'btn.goDrive': 'Open Google Drive',
      'form.fnRuleFormat': 'Category_Name_Piece.mp4',
      'form.fnRuleFormatEx': 'e.g. Piano_JohnDoe_Chopin Etude Op.10-4.mp4',
      'form.helpLink': 'What is a Google Drive share link?',
      'form.videoLink': 'Video share link <span class="clf-req">*</span>',
      'form.videoLinkHelp': 'Before submitting, be sure to <strong style="color:#0C3D40;">check that the link opens in an incognito (logged-out) window</strong>.',
      'form.vComposer': 'Composer <span class="clf-req">*</span>',
      'ph.vComposer': 'e.g. F. Chopin',
      'form.vPiece': 'Title of piece <span class="clf-req">*</span>',
      'ph.vPiece': 'e.g. Etude Op.10 No.4',
      'form.secReferral': 'Referral',
      'form.referralDesc': 'How did you hear about this concours? It helps us with future outreach.',
      'form.referralLabel': 'How you heard <span class="clf-req">*</span>',
      'ref.web': 'Carnegie Lee Foundation official website', 'ref.sns': 'Foundation social media (Instagram, Facebook, etc.)', 'ref.youtube': 'YouTube video / ad', 'ref.search': 'Search (Naver, Google, etc.)', 'ref.community': 'Music community / forum', 'ref.school': 'School / academy notice', 'ref.professor': 'Professor / teacher recommendation', 'ref.friend': 'Friend / colleague recommendation', 'ref.press': 'Press / news', 'ref.poster': 'Poster / flyer',
      'ph.referralEtc': 'Please enter how you heard about it',
      'form.secPayment': 'Payment',
      'form.payDesc': 'After submitting, please pay the participation fee to the account below.',
      'form.payFeeSub': 'Paid by all applicants',
      'form.payUnit': 'KRW / per person',
      'form.payDeadlineLabel': 'Payment deadline',
      'form.paySub2': 'Bank transfer only',
      'form.payDeadlineDate': 'Jun 30, 2026 (Tue) 09:00 (New York/EDT)',
      'form.payNote1': '<strong class="clf-warn">⚠ No refunds</strong><br>The participation fee, once paid, <strong>is not refunded under any circumstances.</strong> Please pay carefully.<br><br><span style="font-size:16px; color:#B54E3A; font-weight:700;">When transferring, you must use the format [콩 + 6-digit birthdate + name].</span><br><span style="font-size:15px; color:#0C3D40; font-weight:700;">(e.g. 콩020312HongGilDong)</span>',
      'form.payNote2': '<strong style="color:#0C3D40 !important;">▸ Confirmation of entry</strong><br>Your entry is officially complete only when <strong>both the document/video submission and the fee payment are confirmed</strong>。<br><span style="color: #d32f2f; font-weight: 700;">※ Please set the depositor name in the format [콩 + 6-digit birthdate + name] for quick confirmation.</span>',
      'form.secAgreement': 'Agreement',
      'form.agreeAll': '<strong>I agree to all terms</strong><span class="clf-agree-master-sub">Agree at once to 4 required items and 1 optional item.</span>',
      'form.agree1Label': '<strong>[Required] <span class="clf-req">*</span> I agree to the collection & use of personal information</strong>',
      'form.agree2Label': '<strong>[Required] <span class="clf-req">*</span> I agree to the usage rights for the performance video and content</strong>',
      'form.agree3Label': '<strong>[Required] <span class="clf-req">*</span> I agree to the use of my likeness (portrait rights)</strong>',
      'form.agree4Label': '<strong>[Required] <span class="clf-req">*</span> I agree to the no-refund policy for the participation fee</strong>',
      'form.agree5Label': '<span class="clf-agree-optional-tag">Optional</span><strong>I agree to receive marketing information</strong>',
      'form.submitBtn': 'Submit Application',
      'form.submitHint': 'A confirmation email will be sent to the address you entered.',
      'form.footerInquiry': '<strong>[Inquiries] Carnegie LEE Foundation Office</strong><br>Tel: <a href="tel:1588-8418" style="color:#0C3D40; text-decoration:none; font-weight:700;">1588-8418</a><br>Email: <a href="mailto:info@carnegielee.org" style="color:#0C3D40; text-decoration:none; font-weight:700;">info@carnegielee.org</a><br>Hours: 10:00 ~ 18:00',
      'img.poster': 'poster_11_en.png',
      'form.fileChoose': 'Choose File',
      'form.fileNoChosen': 'No file chosen'
    }
  };

  var origText  = new WeakMap();
  var origHTML  = new WeakMap();
  var origPH    = new WeakMap();
  var origSrc   = new WeakMap();
  var origHref  = new WeakMap();
  var origLabel = new WeakMap();

  function get(lang, key) {
    return (DICT[lang] && DICT[lang][key] != null) ? DICT[lang][key] : null;
  }

  function apply(lang) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (!origText.has(el)) {
        origText.set(el, el.textContent);
        // <option> 은 번역해도 제출값(value)은 한국어 원본으로 고정 (concours.js 저장 안전)
        if (el.tagName === 'OPTION' && !el.hasAttribute('value')) {
          el.setAttribute('value', el.textContent.trim());
        }
      }
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n'));
      el.textContent = (t == null) ? origText.get(el) : t;
    });
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      if (!origLabel.has(el)) origLabel.set(el, el.getAttribute('label') || '');
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n-label'));
      el.setAttribute('label', (t == null) ? origLabel.get(el) : t);
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
    document.querySelectorAll('[data-i18n-href]').forEach(function (el) {
      if (!origHref.has(el)) origHref.set(el, el.getAttribute('href') || '');
      var t = (lang === 'ko') ? null : get(lang, el.getAttribute('data-i18n-href'));
      el.setAttribute('href', (t == null) ? origHref.get(el) : t);
    });

    document.querySelectorAll('.clf-file-text').forEach(function(el) {
      var input = el.parentElement.querySelector('input[type="file"]');
      if (!input || !input.files || input.files.length === 0) {
        var t = (lang === 'ko') ? null : get(lang, 'form.fileNoChosen');
        el.textContent = (t == null) ? '선택된 파일 없음' : t;
      }
    });

    var htmlLang = lang === 'zh' ? 'zh-CN' : (lang === 'en' ? 'en' : 'ko');
    document.documentElement.setAttribute('lang', htmlLang);
    // 네이티브 날짜/시간 입력칸의 표기 형식을 언어에 맞춤 (브라우저 best-effort)
    document.querySelectorAll('input[type="date"], input[type="time"], input[type="datetime-local"], input[type="month"]').forEach(function (el) {
      el.setAttribute('lang', htmlLang);
    });
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
    
    // Convert default file inputs into custom translatable UI
    document.querySelectorAll('input[type="file"]').forEach(function(input) {
      if (input.closest('.clf-upload')) return; // Skip drag & drop areas
      if (input.parentElement.classList.contains('clf-custom-file-wrap')) return;

      var wrap = document.createElement('div');
      wrap.className = 'clf-custom-file-wrap';
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '10px';
      wrap.style.width = '100%';
      wrap.style.padding = '8px 12px';
      wrap.style.background = '#F8F9FA';
      wrap.style.border = '1px solid #E4E4E4';
      wrap.style.borderLeft = '3px solid #EAF3F3';
      wrap.style.borderRadius = '10px';
      wrap.style.boxSizing = 'border-box';
      
      input.parentNode.insertBefore(wrap, input);
      wrap.appendChild(input);
      input.style.display = 'none';
      
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-i18n', 'form.fileChoose');
      btn.textContent = '파일 선택';
      btn.style.padding = '6px 12px';
      btn.style.background = '#fff';
      btn.style.border = '1px solid #ccc';
      btn.style.borderRadius = '4px';
      btn.style.fontSize = '12.5px';
      btn.style.cursor = 'pointer';
      btn.style.color = '#333';
      
      var text = document.createElement('span');
      text.className = 'clf-file-text';
      text.textContent = '선택된 파일 없음';
      text.style.fontSize = '13.5px';
      text.style.color = '#888';
      text.style.flex = '1';
      text.style.overflow = 'hidden';
      text.style.textOverflow = 'ellipsis';
      text.style.whiteSpace = 'nowrap';
      
      btn.onclick = function() { input.click(); };
      
      input.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
          text.textContent = this.files[0].name;
          text.style.color = '#111';
        } else {
          var currentLang = window.__clfLang || 'ko';
          var t = (currentLang === 'ko') ? null : get(currentLang, 'form.fileNoChosen');
          text.textContent = (t == null) ? '선택된 파일 없음' : t;
          text.style.color = '#888';
        }
      });
      
      wrap.appendChild(btn);
      wrap.appendChild(text);
    });
    
    // Apply translation for the newly created elements right away
    apply(saved);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
