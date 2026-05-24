# Carnegie LEE Foundation — 조수미 데뷔 40주년 기념

카네기리 재단 공식 참가신청 사이트 (GitHub Pages 정적 호스팅)

## 🌐 공개 URL

공식 사이트 URL: **https://carnegie-lee.github.io/2026/**

## 📁 페이지 구성

| 페이지 | 경로 |
|---|---|
| 콩쿠르 (메인) | `/` |
| 전시 공모 | `/exhibition/` |
| 합창 콩쿠르 | `/choir/` |

## 📊 광고 채널별 UTM 추적 링크

같은 페이지로 들어와도 어떤 채널에서 유입됐는지 자동으로 구분되어 시트에 저장됩니다.

### 콩쿠르 (메인)

| 채널 | 단축 URL |
|---|---|
| 유료 인스타그램 광고 | `/concours/instagram/` |
| 유료 사이트 광고 | `/concours/site-paid/` |
| 스레드 광고 | `/concours/threads/` |
| 페이스북 광고 | `/concours/facebook/` |
| 유튜브 광고 | `/concours/youtube/` |
| 학교 | `/concours/school/` |
| 개인 인스타그램 | `/concours/instagram-personal/` |
| 입시 학원/선생님 | `/concours/academy-ipsi/` |
| 성인 학원/선생님 | `/concours/academy-adult/` |
| 사이트 (자연유입) | `/concours/site/` |

### 전시 공모

| 채널 | 단축 URL |
|---|---|
| 유료 인스타그램 광고 | `/exhibition/instagram/` |
| 유료 사이트 광고 | `/exhibition/site-paid/` |
| 스레드 광고 | `/exhibition/threads/` |
| 페이스북 광고 | `/exhibition/facebook/` |
| 유튜브 광고 | `/exhibition/youtube/` |
| 학교 | `/exhibition/school/` |
| 개인 인스타그램 | `/exhibition/instagram-personal/` |
| 입시 학원/선생님 | `/exhibition/academy-ipsi/` |
| 성인 학원/선생님 | `/exhibition/academy-adult/` |
| 사이트 (자연유입) | `/exhibition/site/` |

### 합창 콩쿠르

| 채널 | 단축 URL |
|---|---|
| 유료 인스타그램 광고 | `/choir/instagram/` |
| 유료 사이트 광고 | `/choir/site-paid/` |
| 스레드 광고 | `/choir/threads/` |
| 페이스북 광고 | `/choir/facebook/` |
| 유튜브 광고 | `/choir/youtube/` |
| 학교 | `/choir/school/` |
| 개인 인스타그램 | `/choir/instagram-personal/` |
| 입시 학원/선생님 | `/choir/academy-ipsi/` |
| 성인 학원/선생님 | `/choir/academy-adult/` |
| 사이트 (자연유입) | `/choir/site/` |

## 🎯 UTM 파라미터 매핑

채널 폴더로 접속하면 자동으로 아래 UTM이 붙어 본 페이지로 리다이렉트됩니다.

| 폴더 | utm_source | utm_medium | utm_campaign | DB 분류 |
|---|---|---|---|---|
| instagram | instagram | paid | insta_ad | 유료DB |
| site-paid | site | paid | display | 유료DB |
| threads | threads | paid | threads_ad | 유료DB |
| facebook | facebook | paid | fb_ad | 유료DB |
| youtube | youtube | paid | yt_ad | 유료DB |
| school | school | free | school | 무료DB |
| instagram-personal | instagram | free | organic_insta | 무료DB |
| academy-ipsi | academy | free | ipsi | 무료DB |
| academy-adult | academy | free | adult | 무료DB |
| site | site | free | organic | 무료DB |

## 🖼️ 이미지 추가

페이지 상단에 표시되는 대표 이미지는 `images/Group 25.png` 파일을 참조합니다.
실제 이미지를 `images/` 폴더에 동일한 파일명으로 업로드해 주세요.

## 🛠️ 채널 추가 / 수정

광고 채널을 추가하거나 UTM 값을 변경하려면 `tools/gen_redirects.sh` 스크립트를 수정 후 재실행하세요.
