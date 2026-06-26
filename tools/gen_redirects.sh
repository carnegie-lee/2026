#!/bin/bash
set -e

# 채널 정의: 폴더명|utm_source|utm_medium|utm_campaign|한글라벨
CHANNELS=(
  "instagram|instagram|paid|insta_ad|유료 인스타그램 광고"
  "site-paid|site|paid|display|유료 사이트 광고"
  "threads|threads|paid|threads_ad|스레드 광고"
  "facebook|facebook|paid|fb_ad|페이스북 광고"
  "youtube|youtube|paid|yt_ad|유튜브 광고"
  "school|school|free|school|학교"
  "instagram-personal|instagram|free|organic_insta|개인 인스타그램"
  "instagram-official|insta_bio|free|insta_bio|재단 인스타"
  "homepage|homepage|free|homepage|재단 홈페이지"
  "academy-ipsi|academy|free|ipsi|입시 학원/선생님"
  "academy-adult|academy|free|adult|성인 학원/선생님"
  "site|site|free|organic|사이트 (자연유입)"
)

# 섹션 정의: 폴더|타이틀|리다이렉트 기준경로
SECTIONS=(
  "concours|콩쿠르|../../"
  "exhibition|전시 공모|../"
  "choir|합창 콩쿠르|../"
)

create_redirect() {
  local outpath="$1"
  local title="$2"
  local target="$3"
  local label="$4"

  cat > "$outpath" <<HTML
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${target}">
<title>${title} — ${label}</title>
<style>
  html,body{margin:0;padding:0;height:100%;font-family:-apple-system,'Apple SD Gothic Neo','Pretendard Variable',Pretendard,sans-serif;background:#0C3D40;color:#fff;}
  .box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;text-align:center;padding:24px;}
  .spinner{width:36px;height:36px;border:3px solid rgba(255,255,255,.25);border-top-color:#C9A84C;border-radius:50%;animation:s 1s linear infinite;margin-bottom:20px;}
  @keyframes s{to{transform:rotate(360deg);}}
  .tag{font-size:11px;letter-spacing:.3em;color:#C9A84C;font-weight:700;margin-bottom:10px;}
  .msg{font-size:15px;color:rgba(255,255,255,.8);line-height:1.7;}
  a{color:#C9A84C;text-decoration:underline;font-weight:600;}
</style>
</head>
<body>
<div class="box">
  <div class="spinner"></div>
  <div class="tag">REDIRECTING</div>
  <div class="msg">잠시만요, 신청 페이지로 이동 중입니다…<br><a href="${target}">자동 이동되지 않으면 여기를 클릭하세요</a></div>
</div>
<script>location.replace('${target}');</script>
</body>
</html>
HTML
}

for sec in "${SECTIONS[@]}"; do
  IFS='|' read -r sec_folder sec_title sec_base <<< "$sec"
  for ch in "${CHANNELS[@]}"; do
    IFS='|' read -r ch_folder ch_src ch_med ch_camp ch_label <<< "$ch"
    target="${sec_base}?utm_source=${ch_src}&utm_medium=${ch_med}&utm_campaign=${ch_camp}"
    outdir="${sec_folder}/${ch_folder}"
    mkdir -p "$outdir"
    create_redirect "${outdir}/index.html" "$sec_title" "$target" "$ch_label"
  done
done

echo "Total redirects created: $(find concours exhibition choir -mindepth 2 -name index.html | wc -l | tr -d ' ')"
