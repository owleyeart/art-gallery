# Art Gallery — Website Template

A configurable, full-stack art gallery website template built with **React + Vite**, **Express/Node.js**, **Supabase**, and deployed on **Vercel** behind **Cloudflare**.

Incubated as [images.twoseven.art](https://images.twoseven.art) using Images Art Gallery (Overland Park, KS) as the testbed.

---

## Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS      |
| Backend    | Express, Node.js                  |
| Database   | Supabase (PostgreSQL + Auth + Storage) |
| Email      | Resend                            |
| Hosting    | Vercel                            |
| DNS / CDN  | Cloudflare                        |

---

## Features

- **Dynamic site config** — name, logo, colors, fonts, contact info, all editable from the admin panel, no redeploy needed
- **Featured Artist** — front-page spotlight with artwork grid, bio, lightbox
- **Member Gallery** — tiled grid of all active member artists, each with their own full portfolio page
- **Events Calendar** — Google Calendar embed + internal event management
- **Newsletter** — popup signup + admin campaign sender via Resend
- **Admin Panel** — role-based (System / Admin), manage artists, events, documents, site settings
- **Lightbox** — click-to-expand artwork viewer with title/medium/price details

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/owleyeart/art-gallery.git
cd art-gallery
npm install
```

### 2. Configure environment

```bash
cp .env.example frontend/.env.local
cp .env.example backend/.env
```

Fill in your Supabase URL, keys, and Resend API key.

### 3. Run database migrations

In your Supabase project, run `supabase/migrations/001_initial_schema.sql` via the SQL editor or Supabase CLI.

### 4. Start dev servers

```bash
npm run dev
```

Frontend → http://localhost:5173  
Backend API → http://localhost:3001

---

## Roles

| Role   | Access                                           |
|--------|--------------------------------------------------|
| System | Full control, cannot be deleted, manages admins  |
| Admin  | Manages artists, events, documents, site config  |

---

## Template Use

This project is designed to be cloned for new gallery clients. All business-specific config lives in the `site_config` table — swap it out and you have a new gallery site with zero code changes.

---

## License

MIT
