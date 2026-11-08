# Centre Sana — version 2

A new, independent website for **Centre Sana Pluridisciplinaire, Kénitra**, built from scratch in this folder. The reference project is `/Users/ahmedwelee/Documents/sanaWeb`; its source code and database have not been changed. Only the centre's existing images, identity, contact information and service/team information were reused.

## Run locally

Requires Node.js 22.13 or later (Node 24 LTS recommended).

```sh
npm install
npm run dev
```

- Website: http://127.0.0.1:5173
- Administration: http://127.0.0.1:5173/admin
- API: http://127.0.0.1:4301/api/health

A private `.env` file has been created for this local installation. The administrator email and generated password are in that file (`ADMIN_EMAIL` and `ADMIN_PASSWORD`). Do not share it. On a fresh installation, copy `.env.example` to `.env` and set a unique password of at least 12 characters before starting.

The administrator account is created only on the first start. Changing the `.env` password later does not change an existing account. To update it without deleting data, use `npm run admin:password` as described below.

## Included

- Professional navy and teal interface in Arabic and French, with RTL/LTR layouts and locally bundled Arabic and Latin fonts.
- A persistent Arabic/French language switch on the public site, administrator sign-in and dashboard.
- A centre introduction, specialist team preview, service search, direct programme links, and a grouped appointment form.
- Home, about/team, filterable services, filterable photo gallery with accessible image viewer, articles and article detail pages.
- Appointment requests with validation, service preselection, preferred date, consent, and unique request reference.
- Admin sign-in using an HTTP-only session cookie. Passwords are hashed; sessions expire after eight hours.
- Admin dashboard, searchable appointment inbox, status changes and internal notes.
- Service editing, gallery image upload/deletion, and article creation/editing/deletion with draft/published states.
- Persistent SQLite storage and uploaded images in `.data/`. The new site does not connect to the original project's database.

Appointment requests are stored in this site's admin inbox. They do not automatically send email, SMS or WhatsApp messages. A request is not a confirmed appointment; the centre follows up with the family. The WhatsApp and telephone buttons open the centre's existing contact channels.

The initial articles are newly written introductions to the centre and its booking process, not imported posts or dated news. Existing appointments, users, dynamic gallery uploads and articles have not been migrated. The site uses the same publicly displayed hours and phone number as the reference project. The reference site's contact page lists Kénitra only, so this version asks visitors to contact the centre for directions.

## Arabic and French

Use **FR / عربي** in the top bar, on the administrator sign-in screen, or in the dashboard navigation. The language preference is saved in this browser and retained across navigation and refresh. Switching languages preserves information already entered into the appointment form.

The existing service descriptions, gallery captions and introductory articles include French translations. In the admin area, edit the Arabic and French content separately:

- Services: French name and description.
- Articles: French title, category, summary and full content.
- New gallery uploads: an optional French caption alongside the Arabic caption.

For a new article, provide both a French title and French content to display its French version. Otherwise the Arabic version remains available, with a language notice on the article page. Services and photo captions also fall back to Arabic when a French field is empty. Free-text information supplied by families is preserved as entered.

Existing databases are upgraded automatically with additional French fields; Arabic content and appointment records are preserved. Public content endpoints accept `?locale=fr` or `?locale=ar`. Interface translations are in `src/locales/fr.json`; default French centre content is in `server/french-content.js`.

## Production build

```sh
npm run build
npm start
```

This serves both the site and API at http://127.0.0.1:4301. The frontend assets are in `dist/`. The application needs a persistent Node server and is not a static-only deployment.

Before a public deployment, configure an HTTPS reverse proxy, set `NODE_ENV=production` and `APP_ORIGIN` to the exact public HTTPS origin, and back up the `.data` directory. The default host is loopback. Set `HOST=0.0.0.0` only if your deployment needs it. Secure cookies require HTTPS when `NODE_ENV=production` is set. This project is prepared and running locally; it has not been published online.

## Change the administrator password

Update `ADMIN_PASSWORD` in `.env`, then run:

```sh
npm run admin:password
```

This replaces the stored password and invalidates existing sessions. Other site data is preserved.

## Verify

```sh
npm test
npm run build
npm run test:browser
```

The API tests use a temporary database and check validation, authorization, appointment storage and persistence, session logout, draft privacy, publishing, service editing and image validation. Browser tests use a separate `.data/browser-test` database and cover mobile layouts, navigation, filters, image viewer, appointment submission, admin updates article publication, persistent language selection, French layouts and bilingual content editing. Google Chrome is used by default; set `PLAYWRIGHT_CHANNEL=chromium` after `npx playwright install chromium` if Chrome is unavailable.

## Project structure

- `src/`: the new React interface and styles.
- `server/`: Express API, SQLite storage, authentication and initial content.
- `public/images/`: the original centre's photo and logo assets.
- `tests/`: API and browser verification.
- `.env`: private local configuration (excluded from version control).
- `.data/`: database and uploaded media (excluded from version control).
