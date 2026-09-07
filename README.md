# 📍 CampusTrace - OAU Lost & Found Portal

> **Live Production Platform**: [https://campustrace.samkiel.dev](https://campustrace.samkiel.dev)

CampusTrace is a modern, student-centric Lost & Found web platform engineered specifically for Obafemi Awolowo University (OAU), Ile-Ife. Designed to eliminate fragmented social media lost item notices, CampusTrace provides a unified real-time portal for publishing, discovering, delegating, and claiming lost belongings on campus.

---

## 🎓 Academic Project Context

- **Course**: Software Engineering (SEN106 / SEN216)
- **Institution**: Obafemi Awolowo University (OAU), Ile-Ife, Nigeria
- **Organization**: [GROUP7SEN](https://github.com/GROUP7SEN)
- **Project Leadership**:
  - 👑 **Project Lead**: [Samuel Ezekiel](https://samkiel.dev) ([@samkiell](https://github.com/samkiell))
  - ⭐ **Assistant Lead**: [Abba's 🎀](https://github.com/abbasthelittlemonstee) ([@abbasthelittlemonstee](https://github.com/abbasthelittlemonstee))
- **Team Roster**: [Group 7 Contributors List (28 Members)](./docs/CONTRIBUTORS.md)

---

## 📂 Project Repository Structure

```
CampusTrace/
├── 📁 assets/                 # Platform branding & static assets (logos, icons)
│   └── logo.png
├── 📁 docs/                   # Documentation & contributor manifests
│   ├── CONTRIBUTORS.md        # Full 28-member Group 7 team roster
│   ├── PRD.md                 # Product Requirements Document
│   └── README.md
├── 📁 styles/                 # Modular CSS stylesheets (Zero inline styles)
│   ├── about.css              # About page layout & team grid styles
│   ├── admin.css              # Admin portal moderation & table styles
│   └── components.css         # Reusable buttons, badges, modals & form utilities
├── index.html                 # Hero landing page & quick feature overview
├── about.html                 # Project mission & 28-member contributor showcase
├── dashboard.html             # Campus feed, missing/found reporting & profile settings
├── login.html                 # Student authentication sign-in portal
├── register.html              # Student registration portal with matric validation
├── admin.html                 # Restricted administrative portal (PIN: 7024)
├── script.js                  # Core frontend application logic & Firestore real-time engine
├── style.css                  # Global CSS design system tokens & base framework
└── README.md                  # Main repository documentation
```

---

## ⚡ Key Features & Capabilities

- 📢 **Instant Publication**: Fast reporting of missing or found belongings with client-side image compression.
- 💬 **Direct WhatsApp & Email Messaging**: Automated, pre-formatted direct chat links between finder and owner matching user contact preferences.
- 🛡️ **Administrative Security Delegation**: Assign reports to official university bodies (OAU Central Security Unit, DSA, Library, Department Secretariats).
- 🔍 **Real-Time Search & Category Filters**: Instant keyword, category, and missing/found status filtering.
- 🔒 **User Account Moderation**: Full administrator controls with user suspension enforcement and audit management.
- 📱 **Mobile-First Responsive Interface**: 4-box stat card grid, custom image lightboxes, and modern dark-mode design system.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Dark Tokens), Modular JavaScript (ES6+)
- **Backend & Database**: Firebase Firestore (Real-Time Database), Firebase Cloud Storage (Optimized Image Assets)
- **Deployment**: Custom domain deployment via Vercel ([campustrace.samkiel.dev](https://campustrace.samkiel.dev))

---

## 👥 Contributors

For the full list of Group 7 project contributors and profile links, see [CONTRIBUTORS.md](./docs/CONTRIBUTORS.md).

---

© 2026 CampusTrace | Group 7 - SEN106/216 - Obafemi Awolowo University
