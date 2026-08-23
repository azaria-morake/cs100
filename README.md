# CS100 — Distant CS

> **"No Fear. No Favor. Resource-Agnostic Computational Theory."**

A technical publication and editorial web platform built with **Next.js (App Router)**, **TypeScript**, and **Firebase (Cloud Firestore + Auth)**. Preserves the brutalist Swiss academic journal design with full server-side rendering for readers and an interactive editorial CMS for authoring.

---

## 📌 Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Design Tokens & Aesthetic](#design-tokens--aesthetic)
- [Routes & Navigation](#routes--navigation)
- [Editorial CMS & Firebase Backend](#editorial-cms--firebase-backend)
- [Getting Started](#getting-started)
- [Connecting Firebase](#connecting-firebase)

---

## 📖 Overview

**Distant CS** pairs the lightweight, high-contrast, brutalist aesthetic of industrial engineering publications with a modern fullstack backend:

* **For Readers:** Pure, instant server-rendered HTML pages with sub-millisecond feel and perfect SEO.
* **For Editors:** An interactive `/admin` editorial suite with real-time markdown preview, benchmark table builders, ASCII flame graph traces, and direct Firestore transmission.
* **Zero Bloat Fallback:** Runs completely standalone with baked-in fallback seed data even when Firebase credentials are not yet configured.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + React 19
* **Language:** TypeScript 5
* **Styling:** Custom Brutalist CSS Design Tokens + Tailwind CSS v4
* **Backend:** [Firebase Cloud Firestore](https://firebase.google.com/docs/firestore) + [Firebase Authentication](https://firebase.google.com/docs/auth)

```text
               ┌────────────────────────────────────────────────────────┐
               │                     Firebase                          │
               │   • Firestore (Articles, Metadata, Benchmarks)         │
               │   • Firebase Auth (Editorial access)                  │
               └───────────────▲────────────────────────▲───────────────┘
                               │                        │
                    (Writes via Admin)          (Reads & SSR)
                               │                        │
               ┌───────────────┴────────┐      ┌────────┴───────────────┐
               │   /admin Editorial CMS │      │    Public Publication  │
               │  • Interactive Form    │      │  • Pre-rendered HTML   │
               │  • Flame graph builder │      │  • /dissections/[slug] │
               │  • Live preview tab    │      │  • Fast, responsive    │
               └────────────────────────┘      └────────────────────────┘
```

---

## 🎨 Design Tokens & Aesthetic

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--bg` | `#f4f1ea` | Warm newsprint parchment background |
| `--ink` | `#1b1a19` | Deep charcoal primary text and solid borders |
| `--red` | `#cb4035` | High-impact editorial accent and badge fill |
| `--faded` | `#6f6b64` | Muted metadata and subtext |
| `--code-bg` | `#141312` | High-contrast terminal / code background |
| `--code-fg` | `#f4f1ea` | Terminal output text |
| `--border` | `2px solid #1b1a19` | Structural boundary lines |

---

## 🗺️ Routes & Navigation

* **`/`** — Masthead, active status ticker, alert banner, latest featured dissection, and live telemetry sidebar.
* **`/dissections/[slug]`** — Dynamic single-article view with latency audit tables and flame graph diagnostics.
* **`/papers`** — Peer-reviewed formal papers archive with DOIs.
* **`/benchmarks`** — Latency and memory allocation benchmark suites.
* **`/principles`** — First principles computational theory essays.
* **`/audits`** — Production stack trace flame graph audits.
* **`/manifesto`** — Publication manifesto.
* **`/admin`** — Interactive editorial dispatch and live preview CMS.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🔥 Connecting Firebase

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Fill in your project keys from the [Firebase Console](https://console.firebase.google.com/):
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:...
   ```
3. In Firestore, create an `articles` collection or use the `/admin` CMS page to publish articles directly.
