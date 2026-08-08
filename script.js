/**
 * AYU — WhatsApp-First Healthcare Assistant
 * Interactive Controller: Scenarios, Sandbox, Audio waveforms, Theme Toggle & Smooth Scrolling
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initScenarioTabs();
  initVoiceNotes();
  initSandbox();
  initScrollReveals();
  initWhatsAppClicks();
  initSmoothScroll();
});

/* ============================================================
   1. THEME MANAGEMENT (Light / Dark)
   ============================================================ */
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('ayu-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('ayu-theme', next);
      showToast(`Switched to ${next} theme`);
    });
  }
}

/* ============================================================
   2. MOBILE NAVIGATION
   ============================================================ */
function initMobileNav() {
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = mobileMenu.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ============================================================
   3. SCENARIO DATA & TAB CONTROLLER
   ============================================================ */
const SCENARIO_DATA = {
  report: {
    status: "Scenario: Lab Report Breakdown",
    badge: "Instant Summary",
    messages: [
      {
        type: "out",
        time: "10:42 AM",
        media: {
          icon: "pdf",
          title: "Complete_Blood_Count_DrLal.pdf",
          size: "PDF Document • 2.4 MB"
        },
        text: "Please explain what this report says. Are Dad's counts okay?"
      },
      {
        type: "in",
        time: "10:43 AM",
        text: "Namaste! Here is your clear breakdown for <strong>Mr. Gopal Rao (Age 68)</strong>:<br><br>• <strong>Hemoglobin:</strong> 13.8 g/dL — <span class=\"wa-highlight-tag\">✓ Normal</span><br>• <strong>Platelet Count:</strong> 220,000 /µL — <span class=\"wa-highlight-tag\">✓ Normal</span><br>• <strong>HbA1c (Sugar):</strong> 6.8% — <em>Slightly elevated (Target under 7.0% for diabetic seniors)</em>.<br><br>💡 <strong>What this means:</strong> No urgent danger flags found. We've archived this in your health timeline."
      }
    ]
  },
  voice: {
    status: "Scenario: Local Language Voice Notes",
    badge: "Hindi • Telugu • Tamil",
    messages: [
      {
        type: "out",
        time: "11:15 AM",
        voice: {
          duration: "0:12",
          caption: "🎙️ Voice note (Hindi): <em>\"Mera pichhle hafte ka sugar test 180 tha, kya ye normal hai?\"</em>"
        }
      },
      {
        type: "in",
        time: "11:15 AM",
        voice: {
          duration: "0:18",
          caption: "🎙️ AYU Spoken Response (Hindi): <em>\"180 mg/dL khane ke baad thoda high hai. Report Dr. Sharma ko bhej di gayi hai. Kal subah fasting sugar check karein.\"</em>"
        },
        text: "<strong>Translation:</strong> Post-meal 180 mg/dL is moderately high. We have logged this reading and sent an update to your primary clinic."
      }
    ]
  },
  reminder: {
    status: "Scenario: Smart Medication Alert",
    badge: "Dose & Timing Alert",
    messages: [
      {
        type: "in",
        time: "08:00 PM",
        text: "🔔 <strong>Medicine Reminder for Father:</strong><br>Time for <strong>Telmisartan 40mg</strong> (1 tablet after dinner).<br><br>Reply <strong>\"TAKEN\"</strong> or tap the checkmark."
      },
      {
        type: "out",
        time: "08:03 PM",
        text: "Dad took it just now with warm water."
      },
      {
        type: "in",
        time: "08:03 PM",
        text: "✓ Logged! 7-day adherence streak is now <strong>100%</strong>. We notified your caregiver family group on WhatsApp too."
      }
    ]
  },
  records: {
    status: "Scenario: Continuous Medical Records",
    badge: "Auto-Organized History",
    messages: [
      {
        type: "out",
        time: "02:10 PM",
        text: "Send summary of Dad's cardiologists visits for the last 6 months."
      },
      {
        type: "in",
        time: "02:11 PM",
        text: "📋 <strong>Cardiac Timeline Summary (Mr. Gopal Rao):</strong><br><br>• <strong>12 Feb 2026:</strong> ECG & 2D Echo at Apollo Clinic (Normal EF 60%).<br>• <strong>15 Jan 2026:</strong> Lipid Profile at Vijaya Labs (LDL 92 mg/dL).<br>• <strong>Current Meds:</strong> Telmisartan 40mg, Ecosprin 75mg.<br><br><span class=\"wa-highlight-tag\">✓ 1-Tap PDF ready to forward to any new doctor</span>"
      }
    ]
  },
  family: {
    status: "Scenario: Loved Ones' Voice Reminders",
    badge: "Familiar Voice Sync",
    messages: [
      {
        type: "in",
        time: "08:30 AM",
        voice: {
          duration: "0:06",
          caption: "🎙️ Daughter's Voice Note (Pooja): <em>\"Papa, breakfast ayyaka BP tablet marchipokandi!\" (Dad, don't forget your BP tablet after breakfast!)</em>"
        },
        text: "Good morning Uncle! Please take <strong>Telmisartan 40mg</strong> after your breakfast today."
      },
      {
        type: "out",
        time: "08:45 AM",
        text: "Done Pooja amma! Took it."
      },
      {
        type: "in",
        time: "08:45 AM",
        text: "✓ Fantastic! Pooja was notified that you've taken your morning dose."
      }
    ]
  }
};

function initScenarioTabs() {
  const tabs = document.querySelectorAll('.demo__tab');
  const chatContainer = document.getElementById('demoChatContainer');
  const statusLabel = document.getElementById('demoScenarioStatus');

  if (!tabs.length || !chatContainer) return;

  // Render initial active scenario ('report')
  const defaultScenario = SCENARIO_DATA['report'];
  if (defaultScenario) {
    renderScenarioChat(chatContainer, defaultScenario.messages);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      const key = tab.getAttribute('data-scenario');
      const data = SCENARIO_DATA[key];
      if (!data) return;

      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      if (statusLabel) {
        statusLabel.textContent = data.status;
      }

      chatContainer.style.opacity = '0';
      chatContainer.style.transform = 'translateY(6px)';

      setTimeout(() => {
        renderScenarioChat(chatContainer, data.messages);
        chatContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
        chatContainer.style.opacity = '1';
        chatContainer.style.transform = 'translateY(0)';
      }, 120);
    });
  });
}

function renderScenarioChat(container, messages) {
  let html = `<div class="wa-date-pill">Today</div>`;

  messages.forEach(msg => {
    const isOut = msg.type === 'out';
    const bubbleClass = isOut ? 'wa-msg wa-msg--outgoing' : 'wa-msg wa-msg--incoming';
    const author = isOut ? '' : `<div class="wa-msg__author">AYU Assistant ✓</div>`;
    
    let mediaHtml = '';
    if (msg.media) {
      mediaHtml = `
        <div class="wa-msg__media">
          <div class="wa-doc-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
          <div class="wa-doc-info">
            <span class="wa-doc-title">${msg.media.title}</span>
            <span class="wa-doc-size">${msg.media.size}</span>
          </div>
        </div>
      `;
    }

    let voiceHtml = '';
    if (msg.voice) {
      voiceHtml = `
        <div class="wa-voice-card">
          <button class="wa-voice-play-btn" aria-label="Play Voice Note" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          </button>
          <div class="wa-voice-waveform">
            <span style="height: 8px"></span>
            <span style="height: 16px"></span>
            <span style="height: 22px"></span>
            <span style="height: 12px"></span>
            <span style="height: 18px"></span>
            <span style="height: 24px"></span>
            <span style="height: 14px"></span>
            <span style="height: 20px"></span>
            <span style="height: 10px"></span>
            <span style="height: 16px"></span>
          </div>
          <span class="wa-voice-duration">${msg.voice.duration}</span>
        </div>
        ${msg.voice.caption ? `<div class="wa-voice-caption">${msg.voice.caption}</div>` : ''}
      `;
    }

    const textHtml = msg.text ? `<p class="wa-msg__text">${msg.text}</p>` : '';
    const ticks = isOut ? `<span class="wa-ticks">✓✓</span>` : '';

    html += `
      <div class="${bubbleClass} ${msg.voice ? 'wa-msg--voice' : ''}">
        ${author}
        ${mediaHtml}
        ${voiceHtml}
        ${textHtml}
        <div class="wa-msg__meta">
          <span>${msg.time}</span>
          ${ticks}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  initVoiceNotes();
}

/* ============================================================
   4. VOICE NOTE PLAYBACK SIMULATION
   ============================================================ */
function initVoiceNotes() {
  const btns = document.querySelectorAll('.wa-voice-play-btn');

  btns.forEach(btn => {
    btn.removeEventListener('click', handleVoiceClick);
    btn.addEventListener('click', handleVoiceClick);
  });
}

function handleVoiceClick(e) {
  e.preventDefault();
  const btn = e.currentTarget;
  const card = btn.closest('.wa-voice-card');
  if (!card) return;

  const waveform = card.querySelector('.wa-voice-waveform');
  const isPlaying = waveform && waveform.classList.contains('playing');

  // Stop all playing voice notes
  document.querySelectorAll('.wa-voice-waveform.playing').forEach(wf => {
    wf.classList.remove('playing');
    const pBtn = wf.closest('.wa-voice-card')?.querySelector('.wa-voice-play-btn');
    if (pBtn) {
      pBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }
  });

  if (!isPlaying && waveform) {
    waveform.classList.add('playing');
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
    showToast("Playing voice audio in vernacular language...");

    setTimeout(() => {
      waveform.classList.remove('playing');
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
    }, 4000);
  }
}

/* ============================================================
   5. INTERACTIVE CHAT SANDBOX
   ============================================================ */
const SANDBOX_DATA = {
  cbc: {
    query: "“What does HbA1c 6.8% mean?”",
    badge: "Lab Simplifier",
    reply: "<strong>HbA1c 6.8% Breakdown:</strong><br><br>• <strong>Status:</strong> Good control for senior adults with Type 2 Diabetes.<br>• <strong>Safe Target:</strong> Primary doctors generally target 6.5% - 7.0%.<br>• <strong>Next Step:</strong> Continue your morning Metformin 500mg as prescribed and schedule a follow-up test in 3 months.<br><br><span class=\"wa-highlight-tag\">✓ Saved to your lab history</span>"
  },
  bp: {
    query: "“Remind Dad to take Telmisartan 40mg at 8 PM”",
    badge: "Caregiver Reminder",
    reply: "✓ <strong>Caregiver Reminder Created!</strong><br><br>• <strong>Patient:</strong> Father (Mr. Rao)<br>• <strong>Medicine:</strong> Telmisartan 40mg<br>• <strong>Schedule:</strong> Daily at 8:00 PM (After dinner)<br>• <strong>Recipients:</strong> Father's WhatsApp + Caregiver sync."
  },
  emergency: {
    query: "“Show my emergency health card”",
    badge: "Emergency Passport",
    reply: "🚨 <strong>AYU QUICK EMERGENCY CARD:</strong><br><br>• <strong>Patient:</strong> Gopal Rao (Age 68)<br>• <strong>Blood Group:</strong> O+ve<br>• <strong>Allergy:</strong> Penicillin (Severe)<br>• <strong>Active Conditions:</strong> Hypertension, Type 2 Diabetes<br>• <strong>Emergency Contact:</strong> Shaik (+91 98480 12345)<br><br><span class=\"wa-highlight-tag\">✓ Shareable link ready for ER doctors</span>"
  },
  telugu: {
    query: "“Explain in Telugu voice note”",
    badge: "Telugu Audio Engine",
    reply: "🎙️ <strong>తెలుగులో సందేశం (Telugu Voice Guidance):</strong><br><br>\"మీ డాక్టర్ గారు సూచించిన రక్తపోటు మందును ప్రతిరోజూ ఉదయం అల్పాహారం తర్వాత క్రమం తప్పకుండా తీసుకోవాలి.\"<br><br><em>(Translation: Take your doctor-prescribed blood pressure medicine every morning after breakfast without skipping.)</em>"
  }
};

function initSandbox() {
  const pills = document.querySelectorAll('.sandbox-pill');
  const sandboxChat = document.getElementById('sandboxChat');

  if (!pills.length || !sandboxChat) return;

  // Render initial default query ('cbc')
  renderSandboxResponse(sandboxChat, SANDBOX_DATA['cbc']);

  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      e.preventDefault();
      const queryKey = pill.getAttribute('data-query');
      const data = SANDBOX_DATA[queryKey];
      if (!data) return;

      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      sandboxChat.innerHTML = `
        <div class="wa-msg wa-msg--outgoing">
          <p class="wa-msg__text">${data.query}</p>
          <div class="wa-msg__meta"><span>Just now</span> <span class="wa-ticks">✓✓</span></div>
        </div>
        <div class="wa-msg wa-msg--incoming" style="opacity: 0.75;">
          <div class="wa-msg__author">AYU Assistant</div>
          <p class="wa-msg__text"><em>AYU is typing...</em></p>
        </div>
      `;

      setTimeout(() => {
        renderSandboxResponse(sandboxChat, data);
      }, 450);
    });
  });
}

function renderSandboxResponse(container, data) {
  container.innerHTML = `
    <div class="wa-msg wa-msg--outgoing">
      <p class="wa-msg__text">${data.query}</p>
      <div class="wa-msg__meta"><span>Just now</span> <span class="wa-ticks">✓✓</span></div>
    </div>
    <div class="wa-msg wa-msg--incoming">
      <div class="wa-msg__author">AYU Assistant ✓ <span class="wa-lang-tag">${data.badge}</span></div>
      <p class="wa-msg__text">${data.reply}</p>
      <div class="wa-msg__meta"><span>Just now</span></div>
    </div>
  `;
}

/* ============================================================
   6. SMOOTH SCROLLING FOR NAV LINKS
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const navH = document.querySelector('.nav')?.offsetHeight || 72;
        const targetPos = targetEl.getBoundingClientRect().top + window.pageYOffset - navH;
        
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
      }
    });
  });
}

/* ============================================================
   7. SCROLL REVEALS (IntersectionObserver)
   ============================================================ */
function initScrollReveals() {
  const reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ============================================================
   8. WHATSAPP FEEDBACK & TOAST
   ============================================================ */
function initWhatsAppClicks() {
  const waLinks = document.querySelectorAll('a[href*="wa.me"]');
  waLinks.forEach(link => {
    link.addEventListener('click', () => {
      showToast("Connecting to AYU on WhatsApp...");
    });
  });
}

let toastTimer;
function showToast(text) {
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  if (!toast || !toastText) return;

  toastText.textContent = text;
  toast.classList.add('active');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('active');
  }, 3500);
}
