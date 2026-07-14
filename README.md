# Ayu — WhatsApp Outpatient Flow for Hospitals

> Coordinating hospital outpatient flow through WhatsApp. Reducing unnecessary travel, blind waiting times, and repeat trips for lab reports.

![HTML](https://img.shields.io/badge/HTML-45.2%25-orange)
![CSS](https://img.shields.io/badge/CSS-43.3%25-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-11.5%25-yellow)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Early%20Validation-blue)

---

## 📋 Overview

**Ayu** is a pre-launch healthcare platform designed to solve the operational inefficiency of hospital outpatient departments (OPDs) in India. The system leverages WhatsApp — an app virtually every patient already uses — to coordinate patient flow, reduce unnecessary travel overhead, and streamline the entire visit experience.

### The Problem

Patients traveling from rural areas to district hospitals face:
- **Long-distance travel** (often 100km+) consuming a full day and sacrificing daily wages
- **Blind lobby waiting** without visibility into queue status or wait times
- **Repeat trips** to collect lab reports, resulting in additional travel costs
- **Brief consultations** after hours spent traveling and waiting

### The Solution

Ayu connects hospital workflow systems with WhatsApp, enabling:
- ✅ Direct check-in and token setup via QR code or text
- ✅ Just-in-time turn updates with live queue estimates
- ✅ Secure UPI fee payments and billing links in chat
- ✅ Digital reports delivered instantly as PDFs

---

## 🎯 Features

### For Patients
- **Queue transparency** — Know exactly how many people are ahead and estimated arrival time
- **Freedom to wait comfortably** — No need to stand in crowded lobbies
- **Reduced repeat trips** — Lab reports sent directly to WhatsApp
- **One familiar interface** — No app download required; everything happens in WhatsApp

### For Hospitals
- **Reduced desk congestion** — Automation handles status queries and report pickup
- **Real-time OPD tracking** — Operational visibility with automated patient entry
- **Digital billing** — Direct payment links reduce cash handling
- **Better patient satisfaction** — Clear communication reduces confusion and complaints

### For Doctors & Staff
- **Organized consultation schedule** — Pre-checked patients arrive precisely when called
- **Quieter OPDs** — Fewer corridor inquiries and reduced ambient noise
- **Less manual paperwork** — Digital report delivery replaces physical document handling
- **Focused clinical time** — Minimal interruptions during consultations

---

## 🛠 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | HTML5, CSS3 (45.2%), JavaScript (11.5%) |
| **Design System** | Custom CSS variables, responsive grid layout, dark mode support |
| **Styling** | Inter font family, smooth animations, Intersection Observer API |
| **Interactions** | Mobile-responsive navigation, theme toggle, form validation, scroll reveal animations |
| **Backend** | [INTEGRATION LAYER] — Hospital Information System (HIS) connectors (planned) |
| **Messaging** | WhatsApp Business API (planned for backend integration) |

---

## 💻 Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- HTTP/HTTPS server (for local development)
- [Optional] Node.js + Live Server for development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ares006-007/AYU.git
   cd AYU
   ```

2. **Serve locally** (choose one)
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Python 2
   python -m SimpleHTTPServer 8000

   # Using Node.js (if installed)
   npx http-server

   # Using Live Server extension in VS Code
   # Install "Live Server" extension, right-click index.html → "Open with Live Server"
   ```

3. **Open in browser**
   ```
   http://localhost:8000
   ```

---

## 🚀 Usage

### For Visitors
- **Navigate sections** using the top menu (The Burden, How it works, Who it's for, Stage)
- **Toggle dark mode** using the sun/moon icon in the navigation bar
- **Explore the platform** through smooth scroll animations
- **Join the waitlist** by completing the partnership form at the bottom

### For Hospital Partners
- Fill out the **"Request pilot access"** form with:
  - Your name and work email
  - Hospital/organization name
  - Your role (Administrator, Doctor, Technology Partner, Investor, or Other)
  - Optional message about your setup and requirements
- Response within **2 business days**
- Contact: `hello@ayuhealth.in`

### For Developers
- Modify `style.css` for design changes
- Update `index.html` for content updates
- Extend `script.js` for new interactions
- Test responsive behavior on mobile devices (breakpoints at 900px, 768px, 520px)

---

## 📁 Project Structure

```
AYU/
├── index.html              # Main HTML page (landing + waitlist)
├── style.css               # Design system & all styling
├── script.js               # Interactions, animations, form logic
└── README.md               # This file
```

### Key Sections

| Component | Purpose |
|-----------|---------|
| **Navigation** | Fixed header with logo, links, theme toggle, mobile menu |
| **Hero** | Value proposition with mockup preview of WhatsApp integration |
| **Problem** | 4-card grid explaining patient journey pain points |
| **Vision** | 5-step workflow showing how Ayu solves each problem |
| **Why Now** | 3 key market drivers (WhatsApp ubiquity, travel cost, lobby fatigue) |
| **Audience** | Benefits for patients, hospitals, and clinical staff |
| **Status** | Timeline: Completed research → Active design → Upcoming pilots |
| **Waitlist** | Partnership form with submission validation |
| **Footer** | Navigation, contact info, social links |

---

## ⚙️ Configuration

### Theme System

Ayu uses CSS custom properties for theming. Switch between light and dark mode:

```javascript
// In script.js
function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('ayu-theme', theme);
}

// Automatic detection of system preference
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark');
}
```

**Theme Variables** (in `style.css`):
- Light mode: `--bg-primary`, `--text-primary`, `--accent` (#0F766E teal)
- Dark mode: Inverted palette with cyan accents
- Persistent storage: Browser `localStorage` (key: `ayu-theme`)

### Responsive Breakpoints

```css
/* Desktop: Full layout */
max-width: 1200px

/* Tablet: 900px and below */
@media (max-width: 900px) { ... }

/* Mobile: 768px and below */
@media (max-width: 768px) { ... }

/* Small mobile: 520px and below */
@media (max-width: 520px) { ... }
```

### Animations

- **Scroll reveal**: Intersection Observer with 0.1 threshold
- **Page load**: Staggered animations with `reveal-delay-N` classes
- **Transitions**: 200ms (fast), 350ms (normal), 600ms (slow)
- **Easing**: Custom cubic-bezier functions (`--ease-out`, `--ease-in-out`)

---

## 🎥 Demo & Deployment

### Live Demo
**[Deployment Link]** — Coming soon (GitHub Pages)

### To Deploy on GitHub Pages

1. Enable GitHub Pages in repository settings
2. Set source to `main` branch, `/root` folder
3. Access at: `https://Ares006-007.github.io/AYU/`

### To Deploy Elsewhere
```bash
# Build: No build step required (static site)
# Deploy: Upload index.html, style.css, and script.js to your server
# Ensure CORS headers allow WhatsApp API calls (when backend is integrated)
```

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Market research & patient journey mapping
- [x] Pre-launch landing page design
- [x] Dark mode support
- [x] Mobile responsiveness
- [x] Waitlist form & validation

### 🔄 In Progress
- [ ] WhatsApp Business API integration design
- [ ] Message template creation for hospital workflows
- [ ] Live queue estimation algorithms
- [ ] Hospital pilot partnership discussions

### 📋 Planned
- [ ] Hospital Information System (HIS) connectors
- [ ] UPI payment gateway integration
- [ ] Real-time queue tracking dashboard
- [ ] PDF report delivery pipeline
- [ ] Analytics dashboard for hospital operations
- [ ] Multi-language support (Hindi, regional languages)
- [ ] Mobile app for hospital staff (optional)

---

## 🤝 Contributing

We welcome contributions from developers, designers, healthcare professionals, and domain experts.

### How to Contribute

1. **Fork** the repository
2. **Create a feature branch** (`git checkout -b feature/your-idea`)
3. **Make your changes** (follow existing code style)
4. **Test** on mobile and desktop
5. **Commit** with clear messages (`git commit -m "Add feature X"`)
6. **Push** to your fork (`git push origin feature/your-idea`)
7. **Open a Pull Request** with a description

### Contribution Areas
- **Frontend**: UI/UX improvements, accessibility (a11y), animations
- **Design**: Mockups, user flows, interaction patterns
- **Content**: Copy refinement, case studies, testimonials
- **Research**: Healthcare workflows, patient interviews, market analysis
- **Backend** (upcoming): WhatsApp integration, HIS connectors, data pipelines

### Code Style
- Use consistent formatting (2-space indentation)
- Write semantic HTML with ARIA labels
- Follow BEM naming convention for CSS classes
- Add comments for complex JavaScript logic
- Test responsive behavior at all breakpoints

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)** — feel free to use, modify, and distribute with attribution.

---

## 👥 Author

**Ayu Health**

- **Email**: hello@ayuhealth.in
- **Website**: [ayuhealth.in](https://ayuhealth.in)
- **LinkedIn**: [Ayu Health](https://linkedin.com/company/ayu-health)
- **Twitter/X**: [@AyuHealth](https://twitter.com/ayuhealth)

---

## 📞 Contact & Support

### Partnership Inquiries
Interested in piloting Ayu at your hospital?  
**Fill out the partnership form on the landing page** or email `hello@ayuhealth.in`  
Response time: 2 business days

### Bug Reports & Feedback
Found an issue or have a suggestion?  
[Open an issue](https://github.com/Ares006-007/AYU/issues) on GitHub

### Follow Our Progress
- [GitHub Discussions](https://github.com/Ares006-007/AYU/discussions) — Ideas, announcements, Q&A
- [Roadmap Project](https://github.com/Ares006-007/AYU/projects) — Public development timeline

---

<div align="center">

**Building a more humane OPD experience, one WhatsApp message at a time.**

[⭐ Star us on GitHub](https://github.com/Ares006-007/AYU) if you believe in reducing healthcare friction.

</div>
