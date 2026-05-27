// ═══ CODEX DEI — LAYOUT JS (nav, modal, popup) ═══

// Navigation active
function setActiveNav() {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(function(btn) {
    var href = btn.getAttribute('href');
    if (href && page.indexOf(href.replace('.html','')) !== -1) {
      btn.classList.add('active');
    }
  });
}

// Donation popup
var donCount = parseInt(localStorage.getItem('codex_don_count') || '0');
var donLast = parseInt(localStorage.getItem('codex_don_last') || '0');

function checkDonPopup() {
  donCount++;
  localStorage.setItem('codex_don_count', donCount);
  var now = Date.now();
  var hoursSince = (now - donLast) / 3600000;
  if (donCount % 5 === 0 && hoursSince > 1) {
    donLast = now;
    localStorage.setItem('codex_don_last', donLast);
    setTimeout(function() {
      var popup = document.getElementById('donPopup');
      var counter = document.getElementById('donPopupCounter');
      if (popup) {
        if (counter) counter.textContent = '✦ ' + donCount + ' ANALYSES EFFECTUÉES ✦';
        popup.style.display = 'flex';
      }
    }, 2000);
  }
}

function closeDonPopup() {
  var popup = document.getElementById('donPopup');
  if (popup) popup.style.display = 'none';
}

window.addEventListener('DOMContentLoaded', function() {
  setActiveNav();
  // Close popups on background click
  ['donPopup','limitOverlay'].forEach(function(id) {
    var el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', function(e) {
        if (e.target === el) {
          el.style.display = 'none';
        }
      });
    }
  });
});
