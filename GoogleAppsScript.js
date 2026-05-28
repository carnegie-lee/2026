/**
 * 카네기리 재단 [전시 / 콩쿨 / 합창] 통합 신청서 수집 Google Apps Script
 *
 * ─── 사용 방법 ────────────────────────────────────────────
 * 1. 이 코드를 [확장 프로그램 → Apps Script]에 붙여넣으세요.
 * 2. [배포 → 새 배포 → 웹앱]
 *    - 실행 사용자: '나'
 *    - 액세스 권한: '모든 사용자'(Anyone)
 * 3. 발급된 웹앱 URL을 각 HTML의 GAS_URL 변수에 입력하세요.
 *
 * ─── 시트 구조 (시트가 없으면 자동 생성) ─────────────────
 *  [콩쿠르] 24열  [합창] 36열  [전시] 36열
 *  콩쿠르 시작 5열: 접수번호 | 접수일시 | DB유형 | 광고유형 | 유입경로
 *  콩쿠르 끝 5열: 프로필사진(링크) | 심사 상태 | 입금 상태 | 마케팅 동의 | 합격 메일 발송 일시
 *  광고유형은 utm_source + utm_medium 조합으로 "유-인스타", "무-학교" 형식.
 *  '기타' 옵션 필드는 "기타 (직접입력값)" 형식으로 한 셀에 병합.
 *
 *  ⚠️ 시트 열 추가 안내:
 *  기존 시트가 이미 존재한다면 새로 추가된 컬럼은 자동으로 생기지 않습니다.
 *  - 전시: "출품 부문" "매체·기법" "유입 경로" 컬럼이 추가되었습니다.
 *  - 합창: "유입 경로" 컬럼이 추가되었습니다.
 *  새 컬럼을 반영하려면 (1) 기존 시트를 삭제하거나, (2) 헤더에 수동으로 컬럼을 추가하세요.
 *
 * ─── 관리자 합격 메일 일괄 발송 ──────────────────────────
 *  스프레드시트 상단 [📧 운영] 메뉴 → "합격자 일괄 메일 발송"
 *  · "심사 상태" 컬럼을 "합격"으로 변경해 둔 행에만 발송
 *  · 발송 후 "합격 메일 발송 일시" 자동 기록 (중복 발송 방지)
 *  · 메일 본문은 APPROVAL_EMAIL_TEMPLATE() 함수에서 수정
 */

/* ════════════════════════════════════════════════════════════
   Resend API 설정
   ════════════════════════════════════════════════════════════ */
var RESEND_API_KEY = 're_hbnvpm53_C4jjJvsEuUuWxzoNC6hto6So';
var RESEND_FROM = '카네기 Lee 재단 <noreply@carnegielee.org>';

function testDrivePermission() {
  DriveApp.getRootFolder();
  MailApp.getRemainingDailyQuota();
  Logger.log("드라이브 및 이메일 권한이 정상적으로 허용되었습니다!");
}

function doPost(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return output.setContent(JSON.stringify({ status: "error", message: "No post data received" }));
    }

    var payload = JSON.parse(e.postData.contents);
    var formType = payload.formType || "unknown";

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var driveFolder = getOrCreateFolder("[CLF] 신청서 사진");

    var photoUrl = "";
    if (payload.photoData && payload.photoData.indexOf("data:image") === 0) {
      photoUrl = saveBase64ImageToDrive(payload.photoData, payload.refNumber, driveFolder);
    }

    if (formType === "concours") {
      logConcours(ss, payload, photoUrl);
    } else if (formType === "concours_video") {
      logConcoursVideo(ss, payload);
    } else if (formType === "exhibition") {
      logExhibition(ss, payload, photoUrl);
    } else if (formType === "choir") {
      logChoir(ss, payload, photoUrl);
    } else if (formType === "choir_video") {
      logChoirVideo(ss, payload);
    } else {
      return output.setContent(JSON.stringify({ status: "error", message: "Invalid formType: " + formType }));
    }

    var isVideoOnly = (formType === "concours_video" || formType === "choir_video");
    if (payload.email && !isVideoOnly) {
      sendConfirmationEmail(payload);
    }

    return output.setContent(JSON.stringify({ status: "success", refNumber: payload.refNumber }));

  } catch (err) {
    Logger.log(err.toString());
    return output.setContent(JSON.stringify({ status: "error", message: err.toString() }));
  }
}

/* ════════════════════════════════════════════════════════════
   콩쿠르 (25열) — 시트 용도(개인정보/영상심사/DB유형/입금확인)에 맞춘 슬림 구조
   ════════════════════════════════════════════════════════════ */
var TEST_EMAILS = ['dajung8474@naver.com'];
function isTestEmail(email) {
  if (!email) return false;
  return TEST_EMAILS.indexOf((email + '').toLowerCase().trim()) !== -1;
}

function logConcours(ss, payload, photoUrl) {
  var sheetName = "콩쿠르";
  var headers = [
    "접수번호", "접수일시", "DB유형", "광고유형", "유입경로",
    "부문", "악기", "성악 장르",
    "성명", "생년월일", "성별", "연락처", "이메일",
    "주소 (시·도)", "주소 (구·군)",
    "학교명·전공", "활동경력", "주요수상내역",
    "영상공유링크", "연주곡 작곡가", "연주곡 곡명",
    "프로필사진", "심사 상태", "입금 상태", "마케팅 동의", "합격 메일 발송 일시"
  ];
  var sheet = getOrCreateSheet(ss, sheetName, headers);
  ensureSentColumn(sheet);

  var rowData = [
    payload.refNumber || "",
    payload.submittedAt || "",
    isTestEmail(payload.email) ? "테스트DB" : (payload.dbType || "무료DB"),
    mapUtmSourceToKo(payload.utmSource, payload.utmMedium),
    mergeEtc(payload.referral, payload.referralEtc),
    mergeEtc(payload.division, payload.divisionEtc),
    mergeEtc(payload.instrument, payload.instrumentEtc),
    mergeEtc(payload.vocalGenre, payload.vocalGenreEtc),
    payload.nameKo || "",
    payload.birth || "",
    payload.gender || "",
    payload.phone || "",
    payload.email || "",
    payload.addressCity || "",
    payload.addressDistrict || "",
    payload.schoolName || "",
    payload.career || "",
    payload.awards || "",
    payload.videoLink || "",
    payload.vComposer || "",
    payload.vPiece || "",
    photoUrl,
    "대기",
    "대기",
    payload.marketingConsent || "N",
    ""
  ];

  sheet.appendRow(rowData);
  setPhotoRowHeight(sheet);
}

function mergeEtc(value, etcValue) {
  if (!value) return "";
  if (value === "기타" && etcValue) return "기타 (" + etcValue + ")";
  return value;
}

/* ════════════════════════════════════════════════════════════
   콩쿠르 영상 제출 — 기존 행에 영상 정보 업데이트
   ════════════════════════════════════════════════════════════ */
function logConcoursVideo(ss, payload) {
  var sheetName = "콩쿠르";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("콩쿠르 시트를 찾을 수 없습니다.");

  var NAME_COL       = 9;
  var EMAIL_COL      = 13;
  var VIDEO_LINK_COL = 19;
  var V_COMPOSER_COL = 20;
  var V_PIECE_COL    = 21;

  var data = sheet.getDataRange().getValues();
  var refNumber = payload.refNumber;
  var email = payload.email;

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    var rowRef = data[i][0];
    var rowEmail = data[i][EMAIL_COL - 1];

    if (refNumber && rowRef === refNumber) {
      rowIndex = i + 1;
      break;
    } else if (!refNumber && email && rowEmail === email) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, VIDEO_LINK_COL).setValue(payload.videoLink || "");
    sheet.getRange(rowIndex, V_COMPOSER_COL).setValue(payload.vComposer || "");
    sheet.getRange(rowIndex, V_PIECE_COL).setValue(payload.vPiece || "");
  } else {
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = new Array(headers.length);
    for (var j = 0; j < newRow.length; j++) newRow[j] = "";

    newRow[0]                  = payload.refNumber || "[누락-영상단독]";
    newRow[1]                  = payload.submittedAt || "";
    newRow[NAME_COL - 1]       = payload.nameKo || "";
    newRow[EMAIL_COL - 1]      = payload.email || "";
    newRow[VIDEO_LINK_COL - 1] = payload.videoLink || "";
    newRow[V_COMPOSER_COL - 1] = payload.vComposer || "";
    newRow[V_PIECE_COL - 1]    = payload.vPiece || "";
    sheet.appendRow(newRow);
  }
}

/* ════════════════════════════════════════════════════════════
   합창 영상 제출
   ════════════════════════════════════════════════════════════ */
function logChoirVideo(ss, payload) {
  var sheetName = "합창";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("합창 시트를 찾을 수 없습니다.");

  var NAME_COL       = 10;
  var EMAIL_COL      = 19;
  var VIDEO_LINK_COL = 29;
  var V_COMPOSER_COL = 30;
  var V_PIECE_COL    = 31;

  var data = sheet.getDataRange().getValues();
  var refNumber = payload.refNumber;
  var email = payload.email;

  var rowIndex = -1;
  for (var i = 1; i < data.length; i++) {
    var rowRef = data[i][0];
    var rowEmail = data[i][EMAIL_COL - 1];

    if (refNumber && rowRef === refNumber) {
      rowIndex = i + 1;
      break;
    } else if (!refNumber && email && rowEmail === email) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > -1) {
    sheet.getRange(rowIndex, VIDEO_LINK_COL).setValue(payload.videoLink || "");
    sheet.getRange(rowIndex, V_COMPOSER_COL).setValue(payload.vComposer || "");
    sheet.getRange(rowIndex, V_PIECE_COL).setValue(payload.vPiece || "");
  } else {
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = new Array(headers.length);
    for (var j = 0; j < newRow.length; j++) newRow[j] = "";

    newRow[0]                  = payload.refNumber || "[누락-영상단독]";
    newRow[1]                  = payload.submittedAt || "";
    newRow[NAME_COL - 1]       = payload.nameKo || payload.groupName || "";
    newRow[EMAIL_COL - 1]      = payload.email || "";
    newRow[VIDEO_LINK_COL - 1] = payload.videoLink || "";
    newRow[V_COMPOSER_COL - 1] = payload.vComposer || "";
    newRow[V_PIECE_COL - 1]    = payload.vPiece || "";
    sheet.appendRow(newRow);
  }
}

/* ════════════════════════════════════════════════════════════
   합창 (36열)
   ════════════════════════════════════════════════════════════ */
function logChoir(ss, payload, photoUrl) {
  var sheetName = "합창";
  var headers = [
    "접수번호", "접수일시", "폼 종류", "DB유형", "광고유형", "캠페인",
    "신청구분 (개인/단체)", "참가부문", "참가파트",
    "이름/단체명", "대표자 성명", "총 참가인원",
    "단원명단 파일명", "단원명단 내용",
    "생년월일 (대표자)", "성별 (대표자)", "국적",
    "연락처 (대표자)", "이메일 (대표자)",
    "주소 (시·도)", "주소 (구·군)",
    "현재신분", "현재신분 (기타)", "최종학력", "최종학력 (기타)",
    "학교명·전공", "활동경력", "주요수상내역",
    "영상공유링크", "연주곡 작곡가", "연주곡 곡명",
    "유입 경로",
    "프로필사진", "심사 상태", "입금 상태", "마케팅 동의"
  ];
  var sheet = getOrCreateSheet(ss, sheetName, headers);

  var rowData = [
    payload.refNumber || "",
    payload.submittedAt || "",
    "합창",
    payload.dbType || "무료DB",
    mapUtmSourceToKo(payload.utmSource, payload.utmMedium),
    payload.utmCampaign || "",
    payload.applyType || "",
    mergeEtc(payload.division, payload.divisionEtc),
    payload.part || "",
    (payload.applyType === "단체") ? (payload.groupName || "") : (payload.nameKo || ""),
    payload.repName || "",
    payload.groupSize || "1",
    payload.rosterFileName || "",
    payload.rosterList || "",
    payload.birth || "",
    payload.gender || "",
    payload.nationality || "",
    payload.phone || "",
    payload.email || "",
    payload.addressCity || "",
    payload.addressDistrict || "",
    payload.status || "",        payload.statusEtc || "",
    payload.lastEducation || "", payload.lastEducationEtc || "",
    payload.schoolName || "",
    payload.career || "",
    payload.awards || "",
    payload.videoLink || "",
    payload.vComposer || "",
    payload.vPiece || "",
    mergeEtc(payload.referral, payload.referralEtc),
    photoUrl,
    "대기",
    "대기",
    payload.marketingConsent || "N"
  ];

  sheet.appendRow(rowData);
  setPhotoRowHeight(sheet);
}

/* ════════════════════════════════════════════════════════════
   전시 (36열)
   ════════════════════════════════════════════════════════════ */
function logExhibition(ss, payload, photoUrl) {
  var sheetName = "전시";
  var headers = [
    "접수번호", "접수일시", "폼 종류", "DB유형", "광고유형", "캠페인",
    "출품 부문", "매체·기법",
    "성명 (작가명)", "생년월일", "성별", "국적",
    "연락처", "비상연락처", "이메일",
    "주소 (시·도)", "주소 (구·군)", "SNS·포트폴리오 링크",
    "현재신분", "현재신분 (기타)", "최종학력", "최종학력 (기타)",
    "학교명·전공", "활동경력", "주요수상내역",
    "작품 제목", "제작 연도", "작품 크기", "사용 재료",
    "작품 사진 링크", "작품 설명",
    "유입 경로",
    "프로필사진", "심사 상태", "입금 상태", "마케팅 동의"
  ];
  var sheet = getOrCreateSheet(ss, sheetName, headers);

  var rowData = [
    payload.refNumber || "",
    payload.submittedAt || "",
    "전시",
    payload.dbType || "무료DB",
    mapUtmSourceToKo(payload.utmSource, payload.utmMedium),
    payload.utmCampaign || "",
    mergeEtc(payload.division, payload.divisionEtc),
    mergeEtc(payload.medium, payload.mediumEtc),
    payload.nameKo || "",
    payload.birth || "",
    payload.gender || "",
    payload.nationality || "",
    payload.phone || "",
    payload.emergencyPhone || "",
    payload.email || "",
    payload.addressCity || "",
    payload.addressDistrict || "",
    payload.snsLink || "",
    payload.status || "",        payload.statusEtc || "",
    payload.lastEducation || "", payload.lastEducationEtc || "",
    payload.schoolName || "",
    payload.career || "",
    payload.awards || "",
    payload.artworkTitle || "",
    payload.artworkYear || "",
    payload.artworkSize || "",
    payload.artworkMaterials || "",
    payload.artworkPhotoLink || "",
    payload.artworkDescription || "",
    mergeEtc(payload.referral, payload.referralEtc),
    photoUrl,
    "대기",
    "대기",
    payload.marketingConsent || "N"
  ];

  sheet.appendRow(rowData);
  setPhotoRowHeight(sheet);
}

/* ════════════════════════════════════════════════════════════
   헬퍼
   ════════════════════════════════════════════════════════════ */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);

    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold")
               .setBackground("#0C3D40")
               .setFontColor("#FFFFFF")
               .setHorizontalAlignment("center");

    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveBase64ImageToDrive(base64Str, refNumber, folder) {
  try {
    var parts = base64Str.split(",");
    var mimeType = parts[0].match(/:(.*?);/)[1];
    var ext = mimeType.split("/")[1] || "jpg";
    var base64Data = parts[1];
    var decoded = Utilities.base64Decode(base64Data);

    var blob = Utilities.newBlob(decoded, mimeType, refNumber + "_profile." + ext);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    return '=IMAGE("https://drive.google.com/uc?export=view&id=' + fileId + '", 4, 100, 100)';
  } catch (err) {
    return "파일 저장 오류: " + err.toString();
  }
}

function setPhotoRowHeight(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) sheet.setRowHeight(lastRow, 110);
}

/* ════════════════════════════════════════════════════════════
   광고유형 매핑
   ════════════════════════════════════════════════════════════ */
function mapUtmSourceToKo(source, medium) {
  if (!source) return "자연유입";

  var src = (source + '').toLowerCase().trim();
  var med = medium ? (medium + '').toLowerCase().trim() : "";
  var isPaid = (med === "paid");
  var prefix = isPaid ? "유-" : "무-";

  var label;
  switch (src) {
    case "instagram":
    case "insta":
      label = isPaid ? "인스타" : "개인 인스타";
      break;
    case "threads":
    case "thread":
      label = "스레드"; break;
    case "facebook":
    case "fb":
      label = "페이스북"; break;
    case "youtube":
    case "yt":
      label = "유튜브"; break;
    case "school":
    case "univ":
      label = "학교"; break;
    case "prep_academy":
    case "academy_prep":
      label = "입시 학원/선생님"; break;
    case "adult_academy":
    case "academy_adult":
      label = "성인 학원/선생님"; break;
    case "site":
    case "homepage":
      label = "사이트"; break;
    default:
      label = source;
  }
  return prefix + label;
}

/* ════════════════════════════════════════════════════════════
   테스트 함수 — Apps Script 에디터에서 직접 실행
   ════════════════════════════════════════════════════════════ */
function testResendEmail() {
  var testPayload = {
    formType: 'concours',
    email: 'dajung8474@naver.com',
    nameKo: '테스트',
    refNumber: 'CLF-2026-TEST01'
  };
  sendConfirmationEmail(testPayload);
  Logger.log('테스트 이메일 발송 완료 → ' + testPayload.email);
}

/* ════════════════════════════════════════════════════════════
   Resend API 이메일 발송
   ════════════════════════════════════════════════════════════ */
function sendViaResend(to, subject, htmlBody) {
  var response = UrlFetchApp.fetch('https://api.resend.com/emails', {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + RESEND_API_KEY,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify({
      from: RESEND_FROM,
      to: [to],
      subject: subject,
      html: htmlBody
    }),
    muteHttpExceptions: true
  });

  var code = response.getResponseCode();
  if (code !== 200) {
    throw new Error('Resend API error (' + code + '): ' + response.getContentText());
  }
  return JSON.parse(response.getContentText());
}

/* ════════════════════════════════════════════════════════════
   접수 완료 + 참가비 안내 이메일 (Resend 경유, MailApp 대체)
   ════════════════════════════════════════════════════════════ */
function sendConfirmationEmail(payload) {
  var recipient = payload.email;
  if (!recipient) return;

  var formType = payload.formType;
  var name = payload.nameKo || "참가자";
  var refNumber = payload.refNumber || "";

  var subject = "";
  var htmlBody = "";

  if (formType === "concours") {
    subject = "[카네기 Lee 재단] 콩쿠르 참가 신청이 정상 접수되었습니다.";
    htmlBody = buildConcoursConfirmationEmail(name, refNumber);
  } else if (formType === "exhibition") {
    subject = "[카네기 Lee 재단] 지구 힐링 특별전 참가 신청이 정상 접수되었습니다.";
    htmlBody = buildGenericConfirmationEmail(name, refNumber, "지구 힐링 특별전 신인 아티스트 공모");
  } else if (formType === "choir") {
    subject = "[카네기 Lee 재단] 합창제 참가 신청이 정상 접수되었습니다.";
    htmlBody = buildGenericConfirmationEmail(name, refNumber, "합창제");
  } else {
    subject = "[카네기 Lee 재단] 참가 신청이 정상 접수되었습니다.";
    htmlBody = buildGenericConfirmationEmail(name, refNumber, "참가 신청");
  }

  try {
    sendViaResend(recipient, subject, htmlBody);
  } catch (err) {
    Logger.log("Resend 발송 실패, MailApp 대체 시도: " + err.toString());
    try {
      MailApp.sendEmail({ to: recipient, subject: subject, htmlBody: htmlBody, name: "카네기 Lee 재단" });
    } catch (err2) {
      Logger.log("MailApp 발송도 실패: " + err2.toString());
    }
  }
}

/* ── 콩쿠르 전용: 접수 확인 + 참가비 납부 안내 ── */
function buildConcoursConfirmationEmail(name, refNumber) {
  return '' +
    '<div style="font-family: \'Pretendard Variable\', Pretendard, \'Apple SD Gothic Neo\', \'Noto Sans KR\', sans-serif; max-width: 600px; margin: 0 auto; padding: 0; color: #111; background: #fff;">' +

      '<div style="height: 4px; background: linear-gradient(90deg, #C9A84C 0%, #E8D48B 50%, #C9A84C 100%);"></div>' +

      '<div style="padding: 40px 32px 28px; text-align: center;">' +
        '<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; color: #C9A84C; text-transform: uppercase; margin-bottom: 12px;">APPLICATION RECEIVED</div>' +
        '<h2 style="font-size: 22px; font-weight: 700; color: #0C3D40; margin: 0; letter-spacing: -0.02em; line-height: 1.4;">참가 신청이 정상 접수되었습니다</h2>' +
      '</div>' +

      '<div style="padding: 0 32px 24px; font-size: 15px; line-height: 1.85; color: #444; word-break: keep-all;">' +
        '<p style="margin: 0 0 8px;"><strong>' + name + ' 님,</strong></p>' +
        '<p style="margin: 0;">카네기리재단 콩쿠르 참가 신청이 정상적으로 접수되었습니다.<br>아래 안내에 따라 참가비를 납부해 주시기 바랍니다.</p>' +
      '</div>' +

      '<div style="margin: 0 32px 24px; background: #F8F9FA; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #E4E4E4;">' +
        '<div style="font-size: 12px; font-weight: 600; color: #888; margin-bottom: 6px; letter-spacing: 0.05em;">접수번호</div>' +
        '<div style="font-size: 22px; font-weight: 700; color: #0C3D40; letter-spacing: 0.02em;">' + refNumber + '</div>' +
      '</div>' +

      '<div style="margin: 0 32px 24px; border: 1px solid #E4E4E4; border-radius: 12px; overflow: hidden;">' +

        '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #0C3D40;">' +
          '<tr>' +
            '<td style="padding: 20px 24px; vertical-align: middle;">' +
              '<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.12em; color: #C9A84C; text-transform: uppercase;">PARTICIPATION FEE</div>' +
              '<div style="font-size: 12px; color: rgba(255,255,255,0.7); margin-top: 3px;">서류 제출자 전원 납부</div>' +
            '</td>' +
            '<td style="padding: 20px 24px; vertical-align: middle; text-align: right;">' +
              '<div style="font-size: 26px; font-weight: 700; color: #fff;">300,000<span style="font-size: 14px; font-weight: 400; color: rgba(255,255,255,0.7); margin-left: 2px;">원 / 1인</span></div>' +
            '</td>' +
          '</tr>' +
        '</table>' +

        '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #F8F9FA; border-bottom: 1px solid #E4E4E4;">' +
          '<tr>' +
            '<td style="padding: 16px 24px; vertical-align: middle;">' +
              '<div style="font-size: 13px; font-weight: 700; color: #0C3D40;">납부 마감</div>' +
              '<div style="font-size: 12px; color: #888; margin-top: 2px;">은행 계좌 또는 신용카드 납부</div>' +
            '</td>' +
            '<td style="padding: 16px 24px; vertical-align: middle; text-align: right;">' +
              '<div style="font-size: 15px; font-weight: 700; color: #B54E3A;">2026. 06. 08 (월) 16:00</div>' +
            '</td>' +
          '</tr>' +
        '</table>' +

        '<div style="padding: 20px 24px;">' +
          '<table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; color: #333;">' +
            '<tr><td style="width: 80px; padding: 6px 0; color: #888; font-weight: 600; vertical-align: top;">은행명</td><td style="padding: 6px 0; font-weight: 600;">국민은행</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #888; font-weight: 600; vertical-align: top;">계좌번호</td><td style="padding: 6px 0;"><span style="font-family: \'SF Mono\', Consolas, monospace; font-size: 16px; font-weight: 700; color: #0C3D40; letter-spacing: 0.03em;">346501-04-295646</span></td></tr>' +
            '<tr><td style="padding: 6px 0; color: #888; font-weight: 600; vertical-align: top;">예금주</td><td style="padding: 6px 0; font-weight: 600;">카네기리재단</td></tr>' +
          '</table>' +
        '</div>' +

      '</div>' +

      '<div style="margin: 0 32px 16px; padding: 14px 18px; background: #FFF5F5; border-left: 3px solid #d32f2f; border-radius: 0 8px 8px 0; font-size: 13.5px; line-height: 1.7; color: #333; word-break: keep-all;">' +
        '<strong style="color: #d32f2f;">⚠ 환불 불가 안내</strong><br>' +
        '납부된 참가비는 어떠한 경우에도 반환되지 않습니다. 신중히 납부해 주시기 바랍니다.' +
      '</div>' +

      '<div style="margin: 0 32px 16px; padding: 16px 18px; background: #FFF8F0; border-left: 3px solid #C9A84C; border-radius: 0 8px 8px 0; word-break: keep-all;">' +
        '<div style="font-size: 15px; font-weight: 700; color: #B54E3A; margin-bottom: 4px;">반드시 [콩+생년월일6자리+이름] 형식으로 입금해 주세요.</div>' +
        '<div style="font-size: 14px; font-weight: 700; color: #0C3D40;">(예: 콩020312홍길동)</div>' +
      '</div>' +

      '<div style="margin: 0 32px 32px; padding: 16px 18px; background: #F0F7F7; border-left: 3px solid #0C3D40; border-radius: 0 8px 8px 0; font-size: 13.5px; line-height: 1.7; color: #333; word-break: keep-all;">' +
        '<strong style="color: #0C3D40;">▸ 접수 확정 및 영상 제출 안내</strong><br>' +
        '참가비 납입이 확인되어야 콩쿠르 참가 접수가 정식으로 완료됩니다.<br>' +
        '<span style="color: #d32f2f; font-weight: 700;">※ 반드시 참가비를 입금해 주셔야, 추후 영상 제출용 링크가 포함된 개별 안내가 발송됩니다.</span>' +
      '</div>' +

      '<div style="padding: 24px 32px; font-size: 12.5px; line-height: 1.7; color: #888; text-align: center; border-top: 1px solid #E4E4E4; word-break: keep-all;">' +
        '문의: <a href="tel:1588-8418" style="color: #0C3D40; font-weight: 700; text-decoration: none;">1588-8418</a> · <a href="mailto:info@carnegielee.org" style="color: #0C3D40; font-weight: 700; text-decoration: none;">info@carnegielee.org</a><br>' +
        '<span style="font-size: 11px; color: #aaa; margin-top: 8px; display: block;">본 메일은 발신전용입니다. 관련 문의사항은 운영사무국으로 연락주시기 바랍니다.</span>' +
      '</div>' +

    '</div>';
}

/* ── 전시/합창 등 기타 폼: 기존 심플 확인 이메일 ── */
function buildGenericConfirmationEmail(name, refNumber, formTitle) {
  return '' +
    '<div style="font-family: \'Pretendard Variable\', Pretendard, \'Apple SD Gothic Neo\', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111111; background-color: #ffffff; border-top: 4px solid #C9A84C; box-sizing: border-box;">' +
      '<div style="text-align: center; margin-bottom: 30px;">' +
        '<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; color: #C9A84C; text-transform: uppercase; margin-bottom: 10px;">APPLICATION RECEIVED</div>' +
        '<h2 style="font-size: 22px; font-weight: 700; color: #0C3D40; margin: 0; letter-spacing: -0.02em;">참가 신청이 정상 접수되었습니다</h2>' +
      '</div>' +
      '<div style="font-size: 15px; line-height: 1.85; color: #444444; margin-bottom: 30px; word-break: keep-all;">' +
        '<p style="margin: 0 0 12px 0;"><strong>' + name + ' 님,</strong></p>' +
        '<p style="margin: 0;">카네기리재단 ' + formTitle + ' 참가 신청이 정상적으로 접수되었습니다.</p>' +
        '<p style="margin: 15px 0 0 0; color: #d32f2f; font-weight: 600; font-size: 14px; background: #fff5f5; padding: 12px; border-radius: 8px;">※ 참가비 입금이 확인된 참가자에 한하여, 추후 영상 제출용 링크가 포함된 개별 안내 메일이 순차적으로 발송될 예정입니다.</p>' +
      '</div>' +
      '<div style="background-color: #F8F9FA; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 30px; border: 1px solid #E4E4E4;">' +
        '<div style="font-size: 13px; font-weight: 600; color: #888888; margin-bottom: 8px; letter-spacing: 0.05em;">접수번호</div>' +
        '<div style="font-size: 24px; font-weight: 700; color: #0C3D40; letter-spacing: 0.02em;">' + refNumber + '</div>' +
      '</div>' +
      '<div style="font-size: 13px; line-height: 1.7; color: #888888; text-align: center; border-top: 1px solid #E4E4E4; padding-top: 24px; word-break: keep-all;">' +
        '심사 결과는 추후 개별 통지됩니다.<br>' +
        '<span style="font-size: 11.5px; color: #aaaaaa; margin-top: 10px; display: block; line-height: 1.5;">본 메일은 발신전용 메일입니다. 관련 문의사항은 운영사무국으로 연락주시기 바랍니다.</span>' +
      '</div>' +
    '</div>';
}

/* ════════════════════════════════════════════════════════════
   [관리자] 합격자 일괄 메일 발송
   ════════════════════════════════════════════════════════════ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("📧 운영")
    .addItem("합격자 일괄 메일 발송 (콩쿠르)", "sendApprovalEmailsToAllPassed")
    .addToUi();
}

function sendApprovalEmailsToAllPassed() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("콩쿠르");
  if (!sheet) { ui.alert("'콩쿠르' 시트를 찾을 수 없습니다."); return; }

  ensureSentColumn(sheet);

  var colStatus = getColIndexByHeader(sheet, "심사 상태");
  var colEmail  = getColIndexByHeader(sheet, "이메일");
  var colName   = getColIndexByHeader(sheet, "성명");
  var colRef    = getColIndexByHeader(sheet, "접수번호");
  var colSent   = getColIndexByHeader(sheet, "합격 메일 발송 일시");

  if (!colStatus || !colEmail || !colName || !colRef || !colSent) {
    ui.alert("필수 컬럼을 찾지 못했습니다. 헤더(1행)에 '심사 상태/이메일/성명/접수번호/합격 메일 발송 일시'가 있는지 확인해주세요.");
    return;
  }

  var data = sheet.getDataRange().getValues();
  var targets = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var status = (row[colStatus - 1] || "").toString().trim();
    var email  = (row[colEmail - 1]  || "").toString().trim();
    var sent   = row[colSent - 1];
    if (status === "합격" && email && !sent) {
      targets.push({
        row: i + 1,
        name: row[colName - 1] || "참가자",
        email: email,
        ref: row[colRef - 1] || ""
      });
    }
  }

  if (targets.length === 0) {
    ui.alert("발송할 대상이 없습니다.\n· '심사 상태' 컬럼을 '합격'으로 변경한 행이 있어야 합니다.\n· 이미 발송된 행은 제외됩니다.");
    return;
  }

  var preview = targets.slice(0, 5).map(function (t) { return "· " + t.name + " <" + t.email + ">"; }).join("\n");
  if (targets.length > 5) preview += "\n… 외 " + (targets.length - 5) + "명";

  var resp = ui.alert(
    "합격자 메일 발송",
    "총 " + targets.length + "명에게 합격 안내 메일을 발송합니다.\n\n" + preview + "\n\n발송 후엔 같은 사람에게 다시 보낼 수 없습니다.\n계속하시겠습니까?",
    ui.ButtonSet.OK_CANCEL
  );
  if (resp !== ui.Button.OK) return;

  var now = new Date();
  var stamp = Utilities.formatDate(now, "Asia/Seoul", "yyyy-MM-dd HH:mm");
  var ok = 0, fail = 0, failMsgs = [];

  targets.forEach(function (t) {
    try {
      sendViaResend(t.email, APPROVAL_EMAIL_SUBJECT(t), APPROVAL_EMAIL_TEMPLATE(t));
      sheet.getRange(t.row, colSent).setValue(stamp);
      ok++;
    } catch (err) {
      fail++;
      failMsgs.push(t.name + "(" + t.email + "): " + err.toString());
      Logger.log("합격 메일 발송 실패: " + t.email + " — " + err.toString());
    }
  });

  var msg = "✓ 발송 성공: " + ok + "명\n✗ 발송 실패: " + fail + "명";
  if (fail > 0) msg += "\n\n실패 상세 (Apps Script 로그에서도 확인 가능):\n" + failMsgs.slice(0, 5).join("\n");
  ui.alert("발송 완료", msg, ui.ButtonSet.OK);
}

function getColIndexByHeader(sheet, headerName) {
  if (sheet.getLastColumn() === 0) return 0;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  for (var i = 0; i < headers.length; i++) {
    if ((headers[i] || "").toString().trim() === headerName) return i + 1;
  }
  return 0;
}

function ensureSentColumn(sheet) {
  if (getColIndexByHeader(sheet, "합격 메일 발송 일시") > 0) return;
  var lastCol = sheet.getLastColumn() || 1;
  var newCol = lastCol + 1;
  sheet.getRange(1, newCol).setValue("합격 메일 발송 일시")
    .setFontWeight("bold").setBackground("#0C3D40").setFontColor("#FFFFFF").setHorizontalAlignment("center");
}

/* ════════════════════════════════════════════════════════════
   합격 메일 본문
   ════════════════════════════════════════════════════════════ */
function APPROVAL_EMAIL_SUBJECT(target) {
  return "[카네기 Lee 재단 콩쿠르] 본선 진출 안내 (접수번호: " + (target.ref || "") + ")";
}

function APPROVAL_EMAIL_TEMPLATE(target) {
  var name = target.name || "참가자";
  var refNumber = target.ref || "";

  var eventDate = "(본선 일정은 추후 안내)";
  var fee = "300,000원";
  var bank = "농협 302-1509-5177-81 (예금주: 이예영 / 카네기리퀘이츠)";
  var depositDeadline = "(입금 마감일 추후 공지)";
  var depositMemo = "콩+생년월일6자리+이름 (예: 콩020312홍길동)";

  return '' +
    '<div style="font-family: \'Pretendard Variable\', Pretendard, \'Apple SD Gothic Neo\', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111111; background-color: #ffffff; border-top: 4px solid #C9A84C; box-sizing: border-box;">' +
      '<div style="text-align: center; margin-bottom: 30px;">' +
        '<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; color: #C9A84C; text-transform: uppercase; margin-bottom: 10px;">FINAL ROUND ADMISSION</div>' +
        '<h2 style="font-size: 22px; font-weight: 700; color: #0C3D40; margin: 0; letter-spacing: -0.02em;">본선 진출을 진심으로 축하드립니다 🎉</h2>' +
      '</div>' +
      '<div style="font-size: 15px; line-height: 1.85; color: #444; margin-bottom: 26px; word-break: keep-all;">' +
        '<p style="margin:0 0 12px 0;"><strong>' + name + ' 님,</strong></p>' +
        '<p style="margin:0;">카네기 Lee 재단 콩쿠르 본선 진출이 확정되었습니다. 아래 안내를 확인하시고, 기한 내 참가비 납부로 본선 참가를 최종 확정해 주시기 바랍니다.</p>' +
      '</div>' +
      '<div style="background:#F8F9FA; border:1px solid #E4E4E4; border-radius:12px; padding:20px 22px; margin-bottom:22px;">' +
        '<div style="font-size:12px; font-weight:700; color:#0C3D40; letter-spacing:0.06em; margin-bottom:10px;">📅 본선 일정</div>' +
        '<div style="font-size:14px; line-height:1.7; color:#222;">' + eventDate + '</div>' +
      '</div>' +
      '<div style="background:#F8F9FA; border:1px solid #E4E4E4; border-radius:12px; padding:20px 22px; margin-bottom:22px;">' +
        '<div style="font-size:12px; font-weight:700; color:#0C3D40; letter-spacing:0.06em; margin-bottom:10px;">💳 참가비 안내</div>' +
        '<div style="font-size:14px; line-height:1.85; color:#222;">' +
          '· <strong>금액</strong>: ' + fee + '<br>' +
          '· <strong>계좌</strong>: ' + bank + '<br>' +
          '· <strong>입금자명</strong>: ' + depositMemo + '<br>' +
          '· <strong>납부 마감</strong>: ' + depositDeadline +
        '</div>' +
        '<div style="margin-top:14px; padding:10px 12px; background:#FFF6E5; border-left:3px solid #C9A84C; font-size:12.5px; line-height:1.65; color:#664400;">' +
          '⚠ 참가비는 어떠한 경우에도 환불되지 않습니다. 납부와 함께 본선 참가가 최종 확정됩니다.' +
        '</div>' +
      '</div>' +
      '<div style="background:#0C3D40; color:#fff; border-radius:12px; padding:18px 22px; text-align:center; margin-bottom:24px;">' +
        '<div style="font-size:12px; font-weight:600; color:#C9A84C; margin-bottom:6px; letter-spacing:0.06em;">접수번호</div>' +
        '<div style="font-size:20px; font-weight:700; letter-spacing:0.02em;">' + refNumber + '</div>' +
      '</div>' +
      '<div style="font-size:12.5px; line-height:1.7; color:#888; text-align:center; border-top:1px solid #E4E4E4; padding-top:20px; word-break:keep-all;">' +
        '본선 진행 관련 자세한 사항은 추후 별도 안내드릴 예정입니다.<br>' +
        '<span style="font-size:11px; color:#aaa; margin-top:8px; display:block; line-height:1.5;">본 메일은 발신전용입니다. 문의는 운영사무국으로 연락 바랍니다.</span>' +
      '</div>' +
    '</div>';
}
