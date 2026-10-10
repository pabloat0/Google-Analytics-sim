# Digital Marketing Website

A modern, responsive digital marketing website built with **React**, **Vite** and **Tailwind CSS**. It includes animated landing sections, service pages, a portfolio, a public blog, and a protected **admin dashboard** (analytics, blog editor, contact messages) powered by **Supabase**.

**Live demo:** https://KumarRahul01.github.io/Marketing-Website

> Replace the link above with your own GitHub Pages URL after deploying.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Available Scripts](#available-scripts)
- [Deployment (GitHub Pages)](#deployment-github-pages)
- [Routes](#routes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

**Public website**
- Fully responsive layout for mobile, tablet and desktop
- Landing page sections: Hero, About, Services, Portfolio, Team, Clients, FAQ, Newsletter, Contact and Footer
- Dedicated service pages: App Development, Web Development, SEO Optimization, Campaign Creation, and Hire Us
- Portfolio gallery with individual project pages
- Smooth scroll and entrance animations (GSAP and AOS)
- Contact form with validation and toast notifications

**Blog**
- Public blog list and individual post pages (slug-based URLs)
- Comments on posts

**Admin dashboard** (login required)
- Email/password authentication via Supabase Auth
- Analytics dashboard with charts (page views, sessions, events)
- Blog management: create, edit and manage posts
- Inbox for messages submitted through the contact form

**Analytics**
- Lightweight built-in page tracking (page views, sessions and custom events) stored in your own Supabase project

---

## Tech Stack

| Area | Tools |
| --- | --- |
| Framework | React 18, Vite 5 |
| Styling | Tailwind CSS 3, PostCSS, Autoprefixer |
| Routing | React Router DOM 6 |
| Animation | GSAP, AOS, React Fast Marquee |
| Forms and UI | React Hook Form, React Toastify, React Icons |
| Charts | Recharts |
| Backend | Supabase (database and authentication) |
| Deployment | GitHub Pages (`gh-pages`) |

---

## Project Structure

```
Marketing-Website/
├── public/                 # Static assets (fonts, favicon)
├── src/
│   ├── components/         # Landing page sections and shared UI
│   ├── services/           # Service pages
│   ├── portfolioProducts/  # Portfolio project page template
│   ├── pages/
│   │   ├── blog/           # Public blog (list and post)
│   │   └── admin/          # Admin layout, login, analytics, blog, messages
│   ├── hooks/              # Custom hooks (page tracking)
│   ├── lib/                # Supabase client, auth context, analytics helpers
│   ├── img/                # Images and media
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── utils/
│   └── Routings.jsx        # App routes
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node.js)
- A free [Supabase](https://supabase.com/) project (needed for the blog, admin panel, messages and analytics)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/Marketing-Website.git
cd Marketing-Website

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# then fill in your Supabase values (see below)

# 4. Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173/Marketing-Website/` (the base path matches the GitHub Pages deployment).

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

You can find both values in your Supabase dashboard under **Project Settings → API**.

> The `.env` file is listed in `.gitignore` and must never be committed. The anon key is designed to be public, but protect your data with **Row Level Security (RLS)** policies (see below).

---

## Supabase Setup

The app reads from and writes to the following tables:

| Table | Purpose |
| --- | --- |
| `posts` | Blog posts |
| `comments` | Comments on blog posts |
| `messages` | Contact form submissions |
| `page_views` | Page view tracking |
| `sessions` | Visitor sessions |
| `events` | Custom analytics events |

Steps:

1. Create the tables above in the Supabase SQL editor (adjust the columns to match the fields used in `src/`).
2. Enable **Row Level Security** on every table and add policies. Typical setup: public read access for published `posts`, public insert for `messages`, `comments`, `page_views`, `sessions` and `events`, and full access only for authenticated admin users.
3. In **Authentication → Users**, create your admin account (email and password). This is the account you use at `/admin/login`.

---

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch |

---

## Deployment (GitHub Pages)

1. In `package.json`, set `homepage` to your own URL:
   ```json
   "homepage": "https://<your-username>.github.io/Marketing-Website"
   ```
2. In `vite.config.js`, make sure `base` matches your repository name:
   ```js
   base: '/Marketing-Website/'
   ```
3. Deploy:
   ```bash
   npm run deploy
   ```
4. In your repository, go to **Settings → Pages** and select the `gh-pages` branch as the source.

**Note:** Supabase environment variables are read at build time, so `.env` must exist locally when you run `npm run deploy`.

**Note:** GitHub Pages does not support client-side routing out of the box, so opening a deep link directly (for example `/blog/my-post`) may show a 404. Navigating from within the site works normally. A common fix is to add a `404.html` that redirects to `index.html`, or to use `HashRouter`.

---

## Routes

| Path | Page |
| --- | --- |
| `/Marketing-Website/` | Home |
| `/app-development` | App Development service |
| `/web-development` | Web Development service |
| `/seo-optimization` | SEO Optimization service |
| `/campagin-creation` | Campaign Creation service |
| `/hireus` | Hire Us |
| `/Marketing-Website/portfolio/*` | Portfolio project pages |
| `/Marketing-Website/blog` | Blog list |
| `/Marketing-Website/blog/:slug` | Blog post |
| `/Marketing-Website/admin/login` | Admin login |
| `/Marketing-Website/admin/analytics` | Analytics dashboard (protected) |
| `/Marketing-Website/admin/blog` | Manage posts (protected) |
| `/Marketing-Website/admin/messages` | Contact messages (protected) |

---

## Contributing

Contributions, issues and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. Add a `LICENSE` file to your repository if you want to use this license.
