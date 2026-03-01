# Add Your Click

A small multi-user click counter website.

## What It Does

- Shows one shared **Total Clicks** value.
- Each click increments the same global counter for everyone.
- Stores the counter in a local SQLite database (`counter.db`).
- Auto-syncs the displayed total every 2.5 seconds.
- Supports reset, but only with admin password (`Shawareb` by default).

## Run Locally (Shared Counter)

1. Open terminal in this folder:
   - `C:\ShawarebCode\Add-Your-Click`
2. Start the app server:
   - `python server.py`
3. Open in browser:
   - `http://127.0.0.1:4173`

Any user who opens this URL and clicks will update the same stored count.
For other users on your local network, share your computer IP like:
- `http://YOUR_LOCAL_IP:4173`

## Reset Protection

- Reset is protected by password on the backend.
- Current password: `Shawareb`
- You can change it with environment variable:
  - PowerShell: `$env:RESET_PASSWORD=\"NewStrongPassword\"; python server.py`

## Data Storage

- Database file: `counter.db`
- API endpoints:
  - `GET /api/count` -> current value
  - `POST /api/click` -> increment and return new value
  - `POST /api/reset` -> reset to zero and return new value (requires `password` in JSON body)

## Screenshots

### Desktop

![Desktop screenshot](docs/screenshot-desktop.png)

### Mobile

![Mobile screenshot](docs/screenshot-mobile.png)

## Project Structure

- `index.html` - page markup
- `css/style.css` - styling (desktop + mobile friendly)
- `js/script.js` - frontend calls shared API endpoints
- `server.py` - static file server + counter API + SQLite logic
- `docs/` - README photos
