/**
 * 카네기리 재단 [전시 / 콩쿨 / 합창] 통합 신청서 수집 Google Apps Script
 * 
 * 1. 이 코드를 복사하여 구글 스프레드시트의 [확장 프로그램] -> [Apps Script] 에 붙여넣으세요.
 * 2. 상단의 [배포] -> [새 배포]를 선택하고 유형을 '웹앱'으로 설정하세요.
 *    - 웹앱을 실행할 사용자: '나' (본인 구글 계정)
 *    - 액세스 권한이 있는 사용자: '모든 사용자' (Anyone)
 * 3. 배포 후 발급받은 '웹앱 URL'을 각 HTML 파일의 `GAS_URL` 변수에 입력하세요.
 */

function doPost(e) {
  // CORS 대응 및 정상 수신 응답 객체 생성
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.TEXT);
  
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return output.setContent(JSON.stringify({ status: "error", message: "No post data received" }));
    }
    
    var payload = JSON.parse(e.postData.contents);
    var formType = payload.formType || "unknown";
    
    // 1. 구글 드라이브 사진 폴더 및 시트 정보 설정
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var driveFolder = getOrCreateFolder("[CLF] 신청서 사진");
    
    // 2. 프로필 사진 파일 변환 저장 (Base64 -> Google Drive File Link)
    var photoUrl = "";
    if (payload.photoData && payload.photoData.startsWith("data:image")) {
      photoUrl = saveBase64ImageToDrive(payload.photoData, payload.refNumber, driveFolder);
    }
    
    // 3. 신청 분야(formType)에 따른 분기 처리 및 시트 기록
    if (formType === "concours") {
      logConcours(ss, payload, photoUrl);
    } else if (formType === "concours_video") {
      logConcoursVideo(ss, payload);
    } else if (formType === "exhibition") {
      logExhibition(ss, payload, photoUrl);
    } else if (formType === "choir") {
      logChoir(ss, payload, photoUrl);
    } else {
      return output.setContent(JSON.stringify({ status: "error", message: "Invalid formType: " + formType }));
    }
    
    // 4. 접수 완료 이메일 발송 (영상 제출은 발송 안함)
    if (payload.email && formType !== "concours_video") {
      sendConfirmationEmail(payload);
    }
    
    return output.setContent(JSON.stringify({ status: "success", refNumber: payload.refNumber }));
    
  } catch (err) {
    Logger.log(err.toString());
    return output.setContent(JSON.stringify({ status: "error", message: err.toString() }));
  }
}

/**
 * 콩쿠르 신청 내역 기록
 */
function logConcours(ss, payload, photoUrl) {
  var sheetName = "콩쿨 명단";
  var headers = [
    "접수번호", "접수일시", "DB유형", "광고유형", "상세유입경로(Campaign)",
    "경연분야", "세부악기", "반주형태", "음역대", "전공장르",
    "성명", "생년월일", "성별", "국적", "연락처", "이메일",
    "주소(시·도)", "주소(구·군)", "현재신분", "최종학력", "학교명·전공",
    "활동경력", "주요수상내역", "영상공유링크", "연주곡 작곡가", "연주곡 곡명",
    "프로필사진(링크)", "심사 상태", "입금 상태", "마케팅동의"
  ];
  
  var sheet = getOrCreateSheet(ss, sheetName, headers);
  
  // 기타 입력값 예외 처리
  var division = payload.division || "";
  if (division === "기타" && payload.divisionEtc) division = "기타 (" + payload.divisionEtc + ")";
  
  var instrument = payload.instrument || "";
  if (instrument === "기타" && payload.instrumentEtc) instrument = "기타 (" + payload.instrumentEtc + ")";
  
  var accompaniment = payload.accompaniment || "";
  if (accompaniment === "기타" && payload.accompanimentEtc) accompaniment = "기타 (" + payload.accompanimentEtc + ")";
  
  var voiceType = payload.voiceType || "";
  if (voiceType === "기타" && payload.voiceTypeEtc) voiceType = "기타 (" + payload.voiceTypeEtc + ")";
  
  var vocalGenre = payload.vocalGenre || "";
  if (vocalGenre === "기타" && payload.vocalGenreEtc) vocalGenre = "기타 (" + payload.vocalGenreEtc + ")";
  
  var status = payload.status || "";
  if (status === "기타" && payload.statusEtc) status = "기타 (" + payload.statusEtc + ")";
  
  var lastEducation = payload.lastEducation || "";
  if (lastEducation === "기타" && payload.lastEducationEtc) lastEducation = "기타 (" + payload.lastEducationEtc + ")";
  
  var referral = payload.referral || "";
  if (referral === "기타" && payload.referralEtc) referral = "기타 (" + payload.referralEtc + ")";
  
  var rowData = [
    payload.refNumber,
    payload.submittedAt,
    payload.dbType || "무료DB",
    mapUtmSourceToKo(payload.utmSource, payload.utmMedium),
    payload.utmCampaign || "",
    division,
    instrument,
    accompaniment,
    voiceType,
    vocalGenre,
    payload.nameKo,
    payload.birth,
    payload.gender || "",
    payload.nationality || "",
    payload.phone,
    payload.email,
    payload.addressCity,
    payload.addressDistrict,
    status,
    lastEducation,
    payload.schoolName,
    payload.career,
    payload.awards,
    payload.videoLink,
    payload.vComposer,
    payload.vPiece,
    photoUrl,
    "대기", // 심사 상태 기본값
    "대기", // 입금 상태 기본값
    payload.marketingConsent || "N"
  ];
  
  sheet.appendRow(rowData);
}

/**
 * 콩쿠르 영상 제출 업데이트
 */
function logConcoursVideo(ss, payload) {
  var sheetName = "콩쿨 명단";
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error("콩쿨 명단 시트를 찾을 수 없습니다.");
  
  var data = sheet.getDataRange().getValues();
  var refNumber = payload.refNumber;
  var email = payload.email; // refNumber가 없으면 이메일로 매칭
  
  var rowIndex = -1;
  // 1번 인덱스(두번째 줄)부터 탐색 (0번은 헤더)
  for (var i = 1; i < data.length; i++) {
    var rowRef = data[i][0]; // A열 (접수번호)
    var rowEmail = data[i][15]; // P열 (이메일)
    
    if (refNumber && rowRef === refNumber) {
      rowIndex = i + 1; // getRange는 1-based index
      break;
    } else if (!refNumber && email && rowEmail === email) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex > -1) {
    // 24번째 열(X열): 영상공유링크
    sheet.getRange(rowIndex, 24).setValue(payload.videoLink || "");
    // 25번째 열(Y열): 연주곡 작곡가
    sheet.getRange(rowIndex, 25).setValue(payload.vComposer || "");
    // 26번째 열(Z열): 연주곡 곡명
    sheet.getRange(rowIndex, 26).setValue(payload.vPiece || "");
  } else {
    // 찾을 수 없는 경우 누락 방지를 위해 새 행에 추가
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var newRow = new Array(headers.length);
    for (var j = 0; j < newRow.length; j++) newRow[j] = "";
    
    newRow[0] = payload.refNumber || "[누락-영상단독제출]";
    newRow[1] = payload.submittedAt;
    newRow[10] = payload.nameKo;
    newRow[15] = payload.email;
    newRow[23] = payload.videoLink;
    newRow[24] = payload.vComposer;
    newRow[25] = payload.vPiece;
    sheet.appendRow(newRow);
  }
}

/**
 * 지구 힐링 특별전 전시 신청 내역 기록
 */
function logExhibition(ss, payload, photoUrl) {
  var sheetName = "전시 명단";
  var headers = [
    "접수번호", "접수일시", "DB유형", "광고유형", "상세유입경로(Campaign)",
    "성명(작가명)", "생년월일", "성별", "국적", "연락처", "비상연락처", "이메일",
    "주소(시·도)", "주소(구·군)", "SNS·포트폴리오링크", "현재신분", "최종학력", "학교명·전공",
    "활동경력", "주요수상내역", "작품제목", "제작연도", "작품크기", "사용재료",
    "작품사진링크", "작품설명문", "프로필사진(링크)", "심사 상태", "입금 상태", "마케팅동의"
  ];
  
  var sheet = getOrCreateSheet(ss, sheetName, headers);
  
  // 기타 입력값 예외 처리
  var status = payload.status || "";
  if (status === "기타" && payload.statusEtc) status = "기타 (" + payload.statusEtc + ")";
  
  var lastEducation = payload.lastEducation || "";
  if (lastEducation === "기타" && payload.lastEducationEtc) lastEducation = "기타 (" + payload.lastEducationEtc + ")";
  
  var referral = payload.referral || "";
  if (referral === "기타" && payload.referralEtc) referral = "기타 (" + payload.referralEtc + ")";
  
  var rowData = [
    payload.refNumber,
    payload.submittedAt,
    payload.dbType || "무료DB",
    mapUtmSourceToKo(payload.utmSource, payload.utmMedium),
    payload.utmCampaign || "",
    payload.nameKo,
    payload.birth,
    payload.gender || "",
    payload.nationality || "",
    payload.phone,
    payload.emergencyPhone || "",
    payload.email,
    payload.addressCity,
    payload.addressDistrict,
    payload.snsLink || "",
    status,
    lastEducation,
    payload.schoolName,
    payload.career,
    payload.awards,
    payload.artworkTitle,
    payload.artworkYear,
    payload.artworkSize,
    payload.artworkMaterials,
    payload.artworkPhotoLink || "",
    payload.artworkDescription || "",
    photoUrl,
    "대기", // 심사 상태 기본값
    "대기", // 입금 상태 기본값
    payload.marketingConsent || "N"
  ];
  
  sheet.appendRow(rowData);
}

/**
 * 합창제 신청 내역 기록
 */
function logChoir(ss, payload, photoUrl) {
  var sheetName = "합창 명단";
  var headers = [
    "접수번호", "접수일시", "DB유형", "광고유형", "상세유입경로(Campaign)",
    "신청구분(개인/단체)", "참가부문", "참가파트", "이름(단체명)", "대표자 성명",
    "총참가인원", "단원명단파일명", "단원명단내용", "생년월일(대표자)", "성별(대표자)",
    "연락처(대표자)", "이메일(대표자)", "주소(시·도)", "주소(구·군)",
    "현재신분", "최종학력", "학교명·전공", "활동경력", "주요수상내역",
    "영상공유링크", "연주곡 작곡가", "연주곡 곡명", "프로필사진(링크)", "심사 상태", "입금 상태", "마케팅동의"
  ];
  
  var sheet = getOrCreateSheet(ss, sheetName, headers);
  
  var rowData = [
    payload.refNumber,
    payload.submittedAt,
    payload.dbType || "무료DB",
    mapUtmSourceToKo(payload.utmSource, payload.utmMedium),
    payload.utmCampaign || "",
    payload.applyType || "",
    payload.division || "",
    payload.part || "",
    payload.nameKo, // 단체명 혹은 개인 성명
    payload.repName || "",
    payload.groupSize || "1",
    payload.rosterFileName || "",
    payload.rosterList || "",
    payload.birth,
    payload.gender || "",
    payload.phone,
    payload.email,
    payload.addressCity,
    payload.addressDistrict,
    payload.status || "",
    payload.lastEducation || "",
    payload.schoolName || "",
    payload.career || "",
    payload.awards || "",
    payload.videoLink || "",
    payload.vComposer || "",
    payload.vPiece || "",
    photoUrl,
    "대기", // 심사 상태 기본값
    "대기", // 입금 상태 기본값
    payload.marketingConsent || "N"
  ];
  
  sheet.appendRow(rowData);
}

/**
 * 헬퍼 함수: 폴더가 있으면 가져오고 없으면 새로 생성
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

/**
 * 헬퍼 함수: 시트가 있으면 가져오고 없으면 생성 및 헤더 세팅
 */
function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    
    // 헤더 행 스타일 설정 (테마 컬러 #0C3D40 가미)
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold")
               .setBackground("#0C3D40")
               .setFontColor("#FFFFFF")
               .setHorizontalAlignment("center");
    
    sheet.setFrozenRows(1); // 1행 틀고정
  }
  return sheet;
}

/**
 * 헬퍼 함수: Base64 형식의 이미지 데이터를 구글 드라이브에 저장하고 접근 가능한 공유 링크 반환
 */
function saveBase64ImageToDrive(base64Str, refNumber, folder) {
  try {
    var parts = base64Str.split(",");
    var mimeType = parts[0].match(/:(.*?);/)[1];
    var ext = mimeType.split("/")[1] || "jpg";
    var base64Data = parts[1];
    var decoded = Utilities.base64Decode(base64Data);
    
    var blob = Utilities.newBlob(decoded, mimeType, refNumber + "_profile." + ext);
    var file = folder.createFile(blob);
    
    // 링크가 있는 누구나 볼 수 있도록 보기 공유 권한 설정
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (err) {
    return "파일 저장 오류: " + err.toString();
  }
}

/**
 * 헬퍼 함수: 영어 UTM 소스를 한국어 광고 유형 명칭으로 자동 매핑
 */
function mapUtmSourceToKo(source, medium) {
  if (!source) return "자연유입";
  
  var src = source.toLowerCase().trim();
  var med = medium ? medium.toLowerCase().trim() : "";
  var isPaid = (med === "paid");
  
  switch(src) {
    case "instagram":
    case "insta":
      return isPaid ? "인스타 (유료)" : "개인 인스타";
    case "threads":
    case "thread":
      return "스레드";
    case "facebook":
    case "fb":
      return "페이스북";
    case "youtube":
    case "yt":
      return "유튜브";
    case "school":
    case "univ":
      return "학교";
    case "prep_academy":
    case "academy_prep":
      return "입시 학원/선생님";
    case "adult_academy":
    case "academy_adult":
      return "성인 학원/선생님";
    case "site":
    case "homepage":
      return "사이트";
    default:
      return source; // 알 수 없는 것은 그대로 출력
  }
}

/**
 * 접수 완료 확인 이메일 발송 (HTML 템플릿 포함)
 */
function sendConfirmationEmail(payload) {
  var recipient = payload.email;
  if (!recipient) return;
  
  var formType = payload.formType;
  var name = payload.nameKo || "참가자";
  var refNumber = payload.refNumber || "";
  
  var subject = "";
  var formTitle = "";
  
  if (formType === "concours") {
    subject = "[카네기 Lee 재단] 콩쿠르 참가 신청이 정상 접수되었습니다.";
    formTitle = "콩쿠르";
  } else if (formType === "exhibition") {
    subject = "[카네기 Lee 재단] 지구 힐링 특별전 참가 신청이 정상 접수되었습니다.";
    formTitle = "지구 힐링 특별전 신인 아티스트 공모";
  } else if (formType === "choir") {
    subject = "[카네기 Lee 재단] 합창제 참가 신청이 정상 접수되었습니다.";
    formTitle = "합창제";
  } else {
    subject = "[카네기 Lee 재단] 참가 신청이 정상 접수되었습니다.";
    formTitle = "참가 신청";
  }
  
  // 프리미엄 HSL 기반 Responsive HTML 이메일 템플릿
  var htmlBody = 
    '<div style="font-family: \'Pretendard Variable\', Pretendard, \'Apple SD Gothic Neo\', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #111111; background-color: #ffffff; border-top: 4px solid #C9A84C; box-sizing: border-box;">' +
      '<div style="text-align: center; margin-bottom: 30px;">' +
        '<div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; color: #C9A84C; text-transform: uppercase; margin-bottom: 10px;">APPLICATION RECEIVED</div>' +
        '<h2 style="font-size: 22px; font-weight: 700; color: #0C3D40; margin: 0; letter-spacing: -0.02em;">참가 신청이 정상 접수되었습니다</h2>' +
      '</div>' +
      '<div style="font-size: 15px; line-height: 1.85; color: #444444; margin-bottom: 30px; word-break: keep-all;">' +
        '<p style="margin: 0 0 12px 0;"><strong>' + name + ' 님,</strong></p>' +
        '<p style="margin: 0;">카네기리재단 ' + formTitle + ' 참가 신청이 정상적으로 접수되었습니다.</p>' +
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
  
  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: htmlBody,
      name: "카네기 Lee 재단"
    });
  } catch (err) {
    Logger.log("이메일 발송 실패: " + err.toString());
  }
}
