var GAS_URL = 'https://script.google.com/macros/s/AKfycbz7gsXxSxKenW7hiXL_E1XWfy64_7GhHrHc3mM9PnHdrAqq_oFr3Kme7Z6FoJNVvaql/exec';

// 모집요강 PDF — 제목/파일명이 바뀌면 아래 두 줄만 수정하면 전 페이지(index·choir·exhibition)에 자동 반영됩니다.
var PDF_FILE  = '카네기LEE_재단_제1회_신인아티스트_콩쿠르_모집요강(수정본).pdf'; // 실제 PDF 파일명 (저장소 루트에 위치)
var PDF_TITLE = '카네기LEE 재단 제1회 신인아티스트 콩쿠르 모집요강(수정본).pdf'; // 화면에 표시되는 이름

(function () {
  // config.js 자신의 위치에서 사이트 루트(절대경로)를 계산 → 하위 폴더(../)에서도 동일하게 동작
  var src = (document.currentScript && document.currentScript.src) || '';
  var base = src.replace(/assets\/config\.js.*$/, '');
  var href = base + encodeURIComponent(PDF_FILE);

  document.querySelectorAll('[data-pdf-href]').forEach(function (a) {
    a.setAttribute('href', href);
  });
  document.querySelectorAll('[data-pdf-title]').forEach(function (el) {
    el.textContent = PDF_TITLE;
  });
})();
