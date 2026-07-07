/* ============================================================
   AYU — Pre-Launch Website
   Interactions & Animations
   ============================================================ */

(function () {
  'use strict';

  // --- Theme Toggle ---
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  const iconSun = themeToggle.querySelector('.icon-sun');
  const iconMoon = themeToggle.querySelector('.icon-moon');

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('ayu-theme', theme);
    if (theme === 'dark') {
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    } else {
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    }
  }

  // Initialize theme
  const savedTheme = localStorage.getItem('ayu-theme');
  if (savedTheme) {
    setTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  themeToggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem('ayu-theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  // --- Mobile Navigation ---
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  function toggleMenu() {
    menuOpen = !menuOpen;
    hamburger.setAttribute('aria-expanded', menuOpen);

    if (menuOpen) {
      mobileMenu.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  hamburger.addEventListener('click', toggleMenu);

  // Close menu on link click
  mobileMenu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      if (menuOpen) toggleMenu();
    });
  });

  // Close menu on escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menuOpen) {
      toggleMenu();
    }
  });

  // --- Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  // --- Nav scroll behavior ---
  const nav = document.getElementById('nav');
  let lastScrollY = 0;

  window.addEventListener(
    'scroll',
    function () {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 100) {
        nav.style.boxShadow = '0 1px 8px rgba(0,0,0,0.06)';
      } else {
        nav.style.boxShadow = 'none';
      }

      lastScrollY = currentScrollY;
    },
    { passive: true }
  );

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    });
  });

  // --- Waitlist Form ---
  const waitlistForm = document.getElementById('waitlistForm');
  const waitlistSuccess = document.getElementById('waitlistSuccess');
  const waitlistSubmit = document.getElementById('waitlistSubmit');

  waitlistForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('waitlist-name').value.trim();
    const email = document.getElementById('waitlist-email').value.trim();
    const role = document.getElementById('waitlist-role').value;

    if (!name || !email || !role) {
      showToast('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    // Simulate submission
    waitlistSubmit.textContent = 'Submitting...';
    waitlistSubmit.disabled = true;
    waitlistSubmit.style.opacity = '0.7';

    setTimeout(function () {
      waitlistForm.style.display = 'none';
      waitlistSuccess.classList.add('active');
      showToast('Welcome to the Ayu waitlist!');
    }, 1200);
  });

  // --- Toast Notification ---
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  let toastTimeout;

  function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('active');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove('active');
    }, 3500);
  }

  // --- Typewriter effect for mockup (subtle) ---
  const mockupRows = document.querySelectorAll('.hero__mockup-row');
  mockupRows.forEach(function (row, i) {
    row.style.opacity = '0';
    row.style.transform = 'translateX(12px)';
    row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    row.style.transitionDelay = 0.8 + i * 0.15 + 's';
  });

  // Trigger mockup animations when hero is visible
  const heroObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          mockupRows.forEach(function (row) {
            row.style.opacity = '1';
            row.style.transform = 'translateX(0)';
          });
          heroObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroObserver.observe(heroSection);
  }

  // --- Timeline step animation ---
  const timelineSteps = document.querySelectorAll('.status__step');
  const timelineObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const steps = entry.target.querySelectorAll('.status__step');
          steps.forEach(function (step, i) {
            setTimeout(function () {
              step.style.opacity = '1';
              step.style.transform = 'translateX(0)';
            }, i * 120);
          });
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  const timeline = document.querySelector('.status__timeline');
  if (timeline) {
    timelineSteps.forEach(function (step) {
      step.style.opacity = '0';
      step.style.transform = 'translateX(-12px)';
      step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
    timelineObserver.observe(timeline);
  }

  // --- Vision flow step animation ---
  const flowSteps = document.querySelectorAll('.vision__flow-step');
  const flowConnectors = document.querySelectorAll('.vision__flow-connector');

  const flowObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          flowSteps.forEach(function (step, i) {
            setTimeout(function () {
              step.style.opacity = '1';
              step.style.transform = 'translateY(0)';
            }, i * 150);
          });
          flowConnectors.forEach(function (conn, i) {
            setTimeout(function () {
              conn.style.opacity = '1';
              conn.style.height = '12px';
            }, i * 150 + 75);
          });
          flowObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  const flowGraphic = document.querySelector('.vision__graphic');
  if (flowGraphic) {
    flowSteps.forEach(function (step) {
      step.style.opacity = '0';
      step.style.transform = 'translateY(8px)';
      step.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    });
    flowConnectors.forEach(function (conn) {
      conn.style.opacity = '0';
      conn.style.height = '0';
      conn.style.transition = 'opacity 0.3s ease, height 0.3s ease';
    });
    flowObserver.observe(flowGraphic);
  }

  // --- Active nav link on scroll ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  const sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            if (link.getAttribute('href') === '#' + id) {
              link.style.color = 'var(--text-accent)';
            } else {
              link.style.color = '';
            }
          });
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: '-80px 0px -50% 0px',
    }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });
})();
