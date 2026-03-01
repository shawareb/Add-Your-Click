# Release Notes — Add Your Click / Tasbeeh تسبيح

## v2.0.0 — The Tasbeeh Revival (March 2026)

**13 years later… it clicks again. 📿**

After more than a decade the project was reborn with a full redesign, a new
purpose, and a shared backend that lets every visitor count together.

### What's New in v2.0.0

- **Redesigned as a Tasbeeh (تسبيح) counter** — tracks shared *Subhana Allah*
  recitations for all connected users in real time.
- **Live shared counter** — every click updates the same global count; the page
  auto-syncs every 2.5 seconds so all visitors stay in sync.
- **SQLite persistence** — the count survives server restarts via `counter.db`.
- **Admin-protected reset** — only users who know the password can reset the
  counter to zero.
- **Mobile-first responsive design** — works beautifully on phones and tablets.
- **Fast-tap animations** — ripple effect and haptic-style feedback on each
  click, optimised for rapid tapping.
- **Arabic + English UI** — bilingual interface honouring the project's spirit.
- **Python backend** (`server.py`) with a clean REST API:
  - `GET  /api/count`  → current value
  - `POST /api/click`  → increment and return new value
  - `POST /api/reset`  → reset to zero (password-protected)

---

## v1.1.0 — Password-Protected Reset (March 2026)

- Reset endpoint now requires an admin password (default: `Shawareb`).
- Password can be overridden via the `RESET_PASSWORD` environment variable.
- Updated README with setup and reset instructions.
- Added desktop and mobile screenshots to `docs/`.

---

## v1.0.0 — The Revival (March 2026)

- Revived the original 2013 codebase.
- Replaced the static client-side counter with a Python HTTP server and a
  shared SQLite-backed API.
- Added `README.md` with run instructions and project structure.

---

## v0.1.0 — Where It All Started (June 19, 2013) 🕰️

> *"Add Click As much you can"*

The very first commit. A single HTML page with one button and one goal: click
as many times as you can. No backend, no database, no framework — just pure
joy in the simplest form.

This tiny project sat quietly in the repository for **13 years**, waiting for
its next chapter.

---

*Built with ❤️ by Ahmed Shawareb — from a fun experiment in 2013 to a daily
Tasbeeh companion in 2026.*
