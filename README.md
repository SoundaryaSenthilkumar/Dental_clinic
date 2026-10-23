# Dental Clinic Website

A blue-and-white dental clinic website with a scroll-driven hero built from 218 frames of your clinic video, an appointment booking system backed by Express and MySQL, and an admin API for managing bookings.

- **Frontend:** React 18 + Vite, GSAP (ScrollTrigger), Lucide icons, custom CSS
- **Backend:** Node.js 18.18+, Express 4, MySQL 8 (mysql2), Nodemailer, JWT admin auth

---

## 1. Project layout

```
dental-clinic/
  frontend/
    public/assets/frames/       218 hero frames, 1920x1080 (desktop)
    public/assets/frames-sm/    218 hero frames, 1280x720 (mobile / small tablets)
    public/assets/images/       hero poster (fallback if the frames fail to load)
    src/data/clinicConfig.js    ← clinic name, address, phone, email, hours, social links
    src/data/doctors.js         ← doctor profiles (DEMO until replaced)
    src/data/treatments.js      treatment cards
    src/data/gallery.js         gallery items
    src/data/testimonials.js    DEMO testimonials
    src/data/frameManifest.json verified mapping: frame_NNN.jpg ↔ original file name
    src/components/             sections, hero, booking form, gallery, contact, footer
  backend/
    database/schema.sql         tables: appointments, doctors, admin_users
    scripts/createAdmin.js      creates administrator accounts
    src/                        Express app, routes, controllers, services, middleware
    tests/                      unit tests for validation logic
  tools/
    build-frames.sh             rebuilds the web frames from the original 4K ZIP
    generate-manifest.py        rebuilds frameManifest.json
```

---

## 2. Prerequisites

- Node.js **18.18 or newer** (20 LTS or 22 LTS recommended)
- MySQL **8.0+** (or MariaDB 10.4+)
- Optional: an SMTP account for confirmation emails

---

## 3. Quick start (local development)

### 3.1 Create the database

```bash
mysql -u root -p < backend/database/schema.sql
```

Create a least-privilege application user. Do not run the app as `root`.

```sql
CREATE USER 'dental_app'@'localhost' IDENTIFIED BY 'choose-a-strong-password';
GRANT SELECT, INSERT, UPDATE ON dental_clinic.* TO 'dental_app'@'localhost';
FLUSH PRIVILEGES;
```

### 3.2 Backend

```bash
cd backend
cp .env.example .env          # then edit .env (see section 4)
npm install
npm test                      # runs the validation unit tests
ADMIN_EMAIL=you@your-clinic.example ADMIN_PASSWORD='a-long-passphrase-here' npm run create-admin
npm run dev                   # API on http://localhost:5000
```

### 3.3 Frontend

```bash
cd frontend
cp .env.example .env          # optional in development
npm install
npm run dev                   # site on http://localhost:5173
```

The Vite dev server forwards `/api` requests to `http://localhost:5000`, so no CORS configuration is needed in development.

### 3.4 Production build

```bash
cd frontend && npm run build  # static files in frontend/dist
cd ../backend && NODE_ENV=production npm start
```

Serve `frontend/dist` from your web server or CDN. Serve the API over HTTPS behind a reverse proxy and set `CORS_ORIGIN` and `VITE_API_BASE_URL` to match your domains. Set `TRUST_PROXY=1` when running behind one proxy, so rate limiting uses the real client IP.

---

## 4. Configuration

### 4.1 Backend (`backend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `PORT` | no | API port (default 5000) |
| `CORS_ORIGIN` | yes in production | Comma-separated frontend origins |
| `TRUST_PROXY` | no | `1` behind a reverse proxy |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | yes | MySQL connection |
| `JWT_SECRET` | yes | 32+ random characters, e.g. `openssl rand -hex 32` |
| `JWT_EXPIRES_IN` | no | Admin session length (default `8h`) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | no | Confirmation emails. Leave `SMTP_HOST` empty to disable them. |
| `CLINIC_EMAIL` | no | Inbox that receives contact-form enquiries. The contact form returns "unavailable" without it. |
| `CLINIC_NAME` | no | Name used in email text |

### 4.2 Frontend (`frontend/.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Leave empty in development. Set to your API URL in production if it is on a different origin. |
| `VITE_MAP_EMBED_URL` | Google Maps embed URL (see 4.4) |

Only `VITE_`-prefixed variables reach the browser. Never put database credentials, SMTP passwords or JWT secrets in frontend variables.

### 4.3 Clinic content: fill in every `REPLACE` entry

Anything containing `REPLACE` is highlighted in yellow on the site, so missing details are easy to find before launch. Update these files:

| File | What to replace |
|---|---|
| `frontend/src/data/clinicConfig.js` | Clinic name, short name, description, address, phone (`phone` and `phoneHref`), WhatsApp number, email, opening hours, directions URL |
| `frontend/src/data/clinicConfig.js` → `SOCIAL_LINKS` | Instagram, Facebook, YouTube, WhatsApp and LinkedIn URLs. Set an unused account to `''` to hide its icon. |
| `frontend/src/data/doctors.js` | Doctor names, qualifications, specialisations, years of experience (or `null` to hide), bios, photos |
| `backend/database/schema.sql` → `doctors` seed | Must match the doctor IDs in `doctors.js`. Re-seed or update the table after changing staff. |
| `frontend/src/data/testimonials.js` | Replace with real, consented patient testimonials, or remove the section |
| `frontend/src/data/gallery.js` and `public/assets/images/gallery/` | Replace the video stills with real clinic photos |
| `frontend/src/components/AboutSection.jsx`, `WhyChooseSection.jsx` | Feature descriptions that describe your equipment and processes |
| `frontend/public/privacy-policy.html`, `terms.html` | Replace with legal text reviewed for your jurisdiction |
| `frontend/src/data/clinicConfig.js` → `SHOW_DEMO_BADGES` | Set to `false` once demo content is gone |
| `frontend/src/components/Logo.jsx` | Your logo mark (replace the SVG) |

### 4.4 Google Maps

1. In Google Maps, search for your clinic, then choose **Share → Embed a map**.
2. Copy only the URL from the `src="..."` attribute of the iframe code.
3. Put it in `frontend/.env` as `VITE_MAP_EMBED_URL=...` and restart `npm run dev`.

The embed URL needs no API key. If you use the Maps JavaScript API instead, add the key in the frontend environment and restrict it to your domain.

---

## 5. How the hero animation works

- **Frames.** `frame_001.jpg` to `frame_218.jpg` are in source order. The manifest in `frameManifest.json` maps each one back to its original filename.
- **Sizes.** Desktop uses 1920×1080 (about 37 MB in total). Screens 900 px wide and under use 1280×720 (about 12 MB), chosen at page load. The original 4K frames (about 240 MB) are not in the project, so keep your ZIP as the archive.
- **Loading.** Frame 1 loads first and gates the hero. The other frames then stream in order, six at a time, and the loader shows a percentage. Frames that fail are skipped, and the nearest loaded frame is drawn in their place.
- **Scrolling.** GSAP ScrollTrigger maps scroll progress to the frame index with a 0.6 s scrub, so the motion catches up smoothly. Drawing happens on GSAP's ticker, and a frame is only redrawn when its index changes.
- **Memory.** Frames are kept as image references, and the browser manages decoded bitmaps. Canvas resolution is capped at 2× device pixel ratio.
- **Depth.** The camera effect is a subtle scale (1.00 → 1.035) and rise, with soft blue glow overlays. These are 2D effects on JPG frames, and the copy does not claim real 3D geometry.
- **Fallbacks.** Reduced-motion users see a static poster and no scroll pinning. If frame 1 fails, the poster is shown.

### 5.1 Regenerating the frames

If the source video or encoding changes, rebuild everything from the original ZIP:

```bash
./tools/build-frames.sh /path/to/dental_clinic_frames_4k.zip
mkdir -p /tmp/src_frames && unzip -q /path/to/dental_clinic_frames_4k.zip -d /tmp/src_frames
python3 tools/generate-manifest.py /tmp/src_frames
```

The script requires ImageMagick. It refuses to run unless exactly 218 frames are present.

**Duplicate frames:** the source has 42 pairs of byte-identical neighbouring frames (for example `frame_012` and `frame_013`). They are kept, as requested, so the timeline is unchanged. Each pair produces a short pause during scrolling. The manifest lists them under `identicalFrameGroups` if you later want to drop the duplicates.

---

## 6. Booking system

### 6.1 Flow

1. The visitor fills in the booking form. Validation runs in the browser first.
2. The browser sends a **client request ID** (a UUID generated once per form). If the request is retried, the server returns the same booking instead of creating a second one.
3. The server validates everything again. It then runs one `INSERT`, and the database rejects a second active booking for the same doctor, date and time (see 6.2).
4. A reference such as `DC-20261022-K7M2Q` is returned. The UI shows the confirmation screen **only** after the server responds with a saved reference.
5. If SMTP is configured, a confirmation email is sent in the background. A failed email does not undo the booking.

### 6.2 Double-booking protection

The `appointments` table has a generated column, `active_slot_key`, which combines the doctor, date and time for any booking that is not cancelled. It carries a `UNIQUE` index, so concurrent requests for the same slot cannot both succeed. Cancelling a booking frees its slot. Reopening a cancelled booking that collides with a newer one returns HTTP 409.

### 6.3 Security measures

- Input validated on the server (names, phone, email, dates, allowed treatments and time slots, message length)
- Honeypot field (`website`) that bots fill in and humans never see
- Rate limits: 5 bookings per IP per 15 minutes, 10 admin sign-in attempts per 15 minutes, 5 contact messages per IP per hour, and a global limit
- Helmet security headers, CORS allow-list, 16 KB request body limit
- Passwords stored as bcrypt hashes. Unknown emails take the same time to check as wrong passwords.
- Admin routes require a signed JWT (HS256). The secret is required and must be at least 32 characters.
- Errors never expose stack traces or SQL details
- Minimal data: no IP addresses or user agents are stored. Contact-form messages are emailed, not saved.

---

## 7. API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | none | Liveness check |
| POST | `/api/appointments` | none (rate limited) | Create a booking. Returns `201` with `{ appointment }`. Returns `200` for a repeated request ID. Returns `409` if the slot has been taken. |
| POST | `/api/contact` | none (rate limited) | Send an enquiry to the clinic inbox. Returns `202`, or `503` if email is not configured. |
| POST | `/api/admin/login` | none (rate limited) | `{ email, password }` → `{ token, expiresIn }` |
| GET | `/api/admin/appointments?status=&date=&page=&limit=` | Bearer token | List bookings with contact details |
| PATCH | `/api/admin/appointments/:id` | Bearer token | `{ status }` where status is `Pending`, `Confirmed`, `Completed` or `Cancelled` |

Example:

```bash
curl -X POST http://localhost:5000/api/admin/login -H "Content-Type: application/json" \
  -d '{"email":"you@your-clinic.example","password":"..."}'

curl "http://localhost:5000/api/admin/appointments?status=Pending" -H "Authorization: Bearer <token>"

curl -X PATCH http://localhost:5000/api/admin/appointments/1 -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" -d '{"status":"Confirmed"}'
```

Admin tokens last 8 hours by default. There is no admin user interface yet; the endpoints above are ready to be connected to one.

---

## 8. Keeping lists in sync

Three lists must match across the stack:

- Treatments: `backend/src/utils/constants.js` ↔ `frontend/src/data/treatments.js`
- Time slots: `backend/src/utils/constants.js` ↔ `frontend/src/data/clinicConfig.js`
- Doctor IDs: `backend/database/schema.sql` ↔ `frontend/src/data/doctors.js`

A mismatch shows up as "Choose a valid…" errors on submit.

---

## 9. Testing

```bash
cd backend && npm test        # validation and reference-number unit tests
```

Recommended before launch:

1. Submit a booking, and check that the row appears in MySQL with status `Pending`.
2. Submit the same booking twice (a double-click or a retry), and confirm that only one row exists.
3. Book the same doctor, date and time from two browsers, and confirm the second is refused.
4. Check the hero on desktop, tablet and phone, and with reduced motion enabled in the OS.
5. Tab through the navigation, booking modal and lightbox, and confirm focus is visible and Escape closes each.
6. Run `npm audit` in both folders.

---

## 10. Limitations and next steps

- **Admin interface.** Only the API is included. A dashboard for staff is a sensible next step.
- **Email.** Confirmation emails need SMTP. Without it, bookings still save, but no email is sent.
- **Slot availability.** The form offers fixed times and does not hide slots that are already taken. A 409 response tells the visitor to pick another time.
- **Doctors and testimonials.** Doctor data lives in code, with the database as a validation source. Moving doctors fully into an admin-managed table is a reasonable next step.
- **Legal pages.** The privacy and terms pages are placeholders and must be replaced before collecting real bookings.
- **Three.js / React Three Fiber.** Not used. The hero is a scroll-driven image sequence, and adding a 3D engine would add weight without changing what the viewer sees.
