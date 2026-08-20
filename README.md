# Vertex Theory

A static, multi-file blog built for one thing: mobile-only build & deploy.
No bundler, no npm install, no build step. Every file is flat in the
project root so any mobile Git client (Working Copy on iOS, etc.) can
clone, edit, and push without fighting nested folders.

---

## 1. File structure (all flat — no subfolders)

| File | Purpose |
|---|---|
| `index.html` | Public homepage — hero, category rail, post grid, newsletter |
| `post.html` | Individual post page — content, likes, comments, share |
| `about.html` | Static about/contact page |
| `admin.html` | Password-protected admin panel (Posts / Appearance / Subscribers / Messages) |
| `style.css` | The entire design system (one file, all pages) |
| `app.js` | Shared utilities: header/footer, settings, Imgur resolver, toast, newsletter form wiring |
| `main.js` | Homepage-only logic |
| `post.js` | Post-page-only logic (likes, comments, share, sidebar) |
| `admin.js` | Admin panel logic (auth, CRUD, CSV export, replies) |
| `firebase-config.js` | **You edit this** — your Firebase project keys |
| `middleware.js` | Vercel Edge Middleware — injects real Open Graph tags per post for social sharing |
| `vercel.json` | Vercel config (adds `noindex` header to admin.html) |
| `firestore.rules` | Paste into Firebase Console → Firestore → Rules |

No `/src`, no `/public`, no `/components` — everything lives at the
repo root.

---

## 2. Design direction (why it looks the way it does)

The name "Vertex Theory" is taken literally: a vertex is the single
turning point of a parabola — the sentence, decision, or discovery a
story pivots on. That idea drives the whole visual system:

- **The mark** — a small parabola curve with a dot sitting exactly on
  its peak — is the logo, and it reappears as a divider, a "like"
  icon, and the loading spinner shape.
- **Category tags** are written like coordinates: `(story)`, in
  monospace — a nod to plotting a point.
- **Read time** is shown with the same peak symbol (`⌃`) instead of a
  clock icon.
- **Palette**: warm sage-paper background (`#EDEFEA`), near-black
  graphite for dark sections, a muted gold for the "vertex" accent,
  a cool blue for links, and a brick-red coral for category eyebrows.
  Deliberately not the cream+terracotta or black+neon combinations
  you'll see on most AI-built sites.
- **Type**: Fraunces (a characterful, slightly quirky serif) for all
  headlines, Manrope for body/UI, and Space Mono for anything
  data-like (dates, tags, read time, admin tables).
- **Motion**: page elements fade/rise in on load and on scroll using
  [Motion](https://motion.dev) (the vanilla-JS successor to Framer
  Motion), loaded straight from a CDN as an ES module — no npm
  install needed.

---

## 3. Firebase setup (Firebase Console — desktop or mobile browser, both fine)

You can do every step below from Safari/Chrome on your iPhone at
console.firebase.google.com — nothing here requires a desktop.

### 3.1 Create the project
1. Go to **console.firebase.google.com** → **Add project**.
2. Name it (e.g. "vertex-theory"). You can disable Google Analytics
   here or enable it — either is fine, it maps to step 3.4.

### 3.2 Register a Web App
1. In your new project, tap the **`</>`** (Web) icon to add a web app.
2. Give it a nickname (e.g. "vertex-theory-web"). You do **not** need
   Firebase Hosting — you're deploying via Vercel.
3. Firebase shows you a config object like:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "...",
     measurementId: "..."
   };
   ```
4. Copy those values into **`firebase-config.js`** in this project,
   replacing the placeholder `"YOUR_..."` strings.

### 3.3 Enable Firestore
1. Left sidebar → **Build → Firestore Database → Create database**.
2. Choose **Production mode** (we supply our own rules below) and
   pick a region close to your readers.
3. Once created, go to the **Rules** tab, delete everything there,
   and paste in the entire contents of **`firestore.rules`** from
   this project. Tap **Publish**.

### 3.4 Enable Authentication (admin login)
1. Left sidebar → **Build → Authentication → Get started**.
2. Under **Sign-in method**, enable **Email/Password**.
3. Go to the **Users** tab → **Add user** → enter the email and
   password you (the admin) want to log in with. That's the only
   account you need — `admin.html` has no public sign-up form.

### 3.5 Enable Analytics (GA4) — optional
If you enabled Analytics in step 3.1, it's already wired up in
`firebase-config.js` (guarded so it never breaks in restricted
in-app browsers). Nothing else to do.

### 3.6 Create the initial site settings document (optional but recommended)
The site works with defaults even if you skip this — but to avoid a
brief flash of default branding on first load:
1. Firestore Database → **Start collection** → collection ID `settings`.
2. Document ID: `site`.
3. Add fields matching what's in `app.js`'s `DEFAULT_SETTINGS` (siteTitle,
   siteTitleAccent, tagline, colorGold, colorBlue, colorCoral, footerNote,
   adSponsorName, adSponsorText, adSponsorLink) — or just skip this and
   set everything from the **Appearance** tab in `admin.html` once it's
   live; it writes this same document for you.

---

## 4. Deploy: GitHub + Vercel, entirely from an iPhone

### 4.1 Push to GitHub (mobile Git client)
1. In your mobile Git app (e.g. **Working Copy**), create a new local
   repository and copy all files from this project into it — flat,
   at the repo root, no subfolder.
2. Commit, then push to a new GitHub repository (Working Copy can
   create the remote repo for you, or create it first at
   github.com/new from Safari, then add it as a remote).

### 4.2 Connect Vercel (mobile web dashboard)
1. Go to **vercel.com** in Safari/Chrome → log in (GitHub login is
   easiest).
2. **Add New… → Project** → select your `vertex-theory` GitHub repo.
3. Framework preset: choose **Other** (this is plain static HTML —
   no build command, no output directory needed; leave both blank
   or set Output Directory to `.`).
4. Before deploying, add an environment variable:
   - **Settings → Environment Variables**
   - Key: `FIRESTORE_PROJECT_ID`
   - Value: your Firebase `projectId` (from step 3.2)
   - Apply to Production, Preview, and Development.
   *(You can also skip this and instead hard-code your project ID
   directly into `middleware.js` at `FALLBACK_PROJECT_ID` before
   pushing — either works.)*
5. Tap **Deploy**.

Vercel will build and give you a live `.vercel.app` URL. Every future
push to your GitHub repo's main branch auto-redeploys — still zero
desktop tooling required.

### 4.3 First login to the admin panel
1. Visit `https://your-site.vercel.app/admin.html`.
2. Sign in with the email/password you created in Firebase step 3.4.
3. Create your first post from the **Posts** tab.

---

## 5. Steps that specifically require desktop tooling

**None of the steps above do.** Everything — Firebase Console setup,
GitHub repo creation/push via a mobile Git client, and the Vercel
dashboard — works fully in Mobile Safari/Chrome or a mobile Git app.

The one thing worth flagging: if you ever want to run a local dev
server to preview changes before pushing, that normally needs a
desktop terminal. You don't need one — you can preview safely using
Vercel's **automatic preview deployments**: push to a branch other
than `main` (most mobile Git clients support creating/pushing
branches), and Vercel deploys a preview URL for that branch
automatically, without touching production.

---

## 6. How the features work

- **Newsletter** — `app.js`'s `wireNewsletterForms()` writes to the
  `subscribers` Firestore collection. View and manage them from
  Admin → Subscribers; **Export CSV** downloads everything as a
  `.csv` file straight from the browser (no server needed).
- **Comments = messages** — a visitor commenting on a post writes to
  `posts/{id}/comments`. Admin → Messages shows every comment across
  every post, grouped by post, with a reply box that writes back to
  the same subcollection tagged `isAdmin: true` — so your reply shows
  up publicly on the post, badged "Vertex Theory".
- **Likes** — a simple counter (`posts/{id}.likes`) incremented via
  Firestore's atomic `increment()`. A `localStorage` flag stops the
  same browser from farming repeat likes; it's not bulletproof
  server-side abuse prevention, just enough for a normal blog.
- **Imgur auto-convert** — pasting `https://imgur.com/abc123` (or a
  gallery/album link) into any image field auto-resolves to
  `https://i.imgur.com/abc123.jpg` behind the scenes, both when
  saving a post in the admin editor and when rendering images inside
  post bodies.
- **Read time** — computed client-side from word count
  (words ÷ 200, rounded up) automatically whenever you type in the
  editor's body field, and stored on the post document.
- **Social preview cards (Open Graph)** — see `middleware.js`. Since
  Facebook/X crawlers don't execute JavaScript, a purely client-
  rendered post page would show blank previews. The included Vercel
  Edge Middleware intercepts requests to `/post.html`, fetches the
  matching post from Firestore's REST API server-side, and swaps in
  the real title/description/image before the HTML is served — so
  shared links preview correctly, `fbclid` and all.
- **Query-param routing** — `/?post=slug`, `/?category=slug`, no
  hashes anywhere, parsed defensively with `URLSearchParams` so
  Facebook's `fbclid` tracking param is simply ignored rather than
  breaking the router.

---

## 7. Sponsor / "Presented by" slot

Set the sponsor name, blurb, and link from **Admin → Appearance →
Sponsor / ad slot**. It renders under every post body. Change the
name to anything — your own brand, a real advertiser, or leave the
default "Advertise here" placeholder.
