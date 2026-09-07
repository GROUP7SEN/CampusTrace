# CampusTrace — Campus Lost and Found System

A web-based platform where students can report lost items, post found items, search listings, and connect with the owner of a matching item.

Built for **SEN106/216: Software Engineering / Web Technologies** (Group 7).

## Team

- **Lead:** Samuel Ezekiel — [@samkiell](https://github.com/samkiell)
- **Co-lead:** Abba's 🎀 — [@abbasthelittlemonstee](https://github.com/abbasthelittlemonstee)
- Full contributor list in [CONTRIBUTORS.md](./CONTRIBUTORS.md)

## Tech Stack

- **HTML5** — Semantic page structure
- **Vanilla CSS3** — Custom dark design system tokens & modular stylesheets
- **JavaScript (ES6+)** — Application logic, client-side validation & image optimization
- **Firebase Firestore & Storage** — Real-time database & cloud storage assets

## Features Completed

- [x] Report a missing item report
- [x] Post a found item report with photo attachment
- [x] Real-time search and multi-category filtering
- [x] Direct WhatsApp & Email poster contact integration
- [x] Administrative security delegation (Security Unit, DSA, Library)
- [x] Mobile-first responsive interface (4-box stat grid, image lightbox)
- [x] Restricted administrative portal (PIN: 7024)

## Project Structure

```
CampusTrace/
├── assets/                 # Platform branding & static assets
├── docs/                   # Documentation & contributor manifests
│   ├── CONTRIBUTORS.md     # Full 28-member Group 7 team roster
│   ├── PRD.md              # Product Requirements Document
│   └── README.md
├── styles/                 # Modular CSS stylesheets
│   ├── about.css           # About page layout & team grid
│   ├── admin.css           # Admin moderation portal styles
│   └── components.css      # Reusable form, button, and modal utilities
├── index.html              # Hero landing page
├── about.html              # Project mission & contributor showcase
├── dashboard.html          # Campus feed & user report portal
├── login.html              # Student authentication portal
├── register.html           # Student registration portal
├── admin.html              # Restricted administrative portal
├── script.js               # Core app logic & Firestore engine
├── style.css               # Global design tokens
└── README.md               # Main repository documentation
```

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/GROUP7SEN/CampusTrace.git
   ```
2. Open `index.html` in any modern web browser — no build step required.

## Live Deployment

- **Production Portal**: [https://campustrace.samkiel.dev](https://campustrace.samkiel.dev)

---

© 2026 CampusTrace | Group 7 - Obafemi Awolowo University
