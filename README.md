# Vertex Theory

A multi-file, vanilla HTML/CSS/JS blog, deployed on Vercel, backed by
Firebase. Built to be managed entirely from a phone — no build step, no
desktop tooling required to run or deploy it.

**Design system:** Editorial Swiss Modernism — warm paper background, near-black
ink, one accent (vertex blue `#1F3FD6`). Display serif is Libre Bodoni, body
is Public Sans, meta/tags/timestamps use IBM Plex Mono. Chosen via the
`ui-ux-pro-max` skill's `--design-system` search for an editorial/publication
product.

---

## 1. File structure

```
vertex-theory/
├── index.html          Homepage — post grid, featured post, newsletter
├── post.html            Single post — reads ?post=slug
├── about.html            About page (has real default copy already)
├── admin.html            Admin panel (login, editor, appearance, subscribers)
├── style.css              Shared public-site styles (design tokens live here)
├── admin.css              Admin-only chrome (dark UI, tabs, table)
├── firebase-config.js     ← YOU EDIT THIS: paste your Firebase config
├── utils.js               Shared helpers (slugify, Imgur converter, dates…)
├── partials.js            Injects the shared header/footer into every page
├── main.js                Homepage logic
├── post.js                Post page logic
├── about.js               About page logic
├── admin.js                Admin panel logic
├── favicon.svg
├── firestore.rules         Paste into Firebase Console → Firestore → Rules
└── STARTER-CONTENT.md      3 ready-to-paste sample posts + About copy
```

Everything is flat — no nested folders beyond this one directory — so it
works cleanly with mobile Git clients (Working Copy, Git2Go, etc.) and the
GitHub mobile app's file browser.

---

## 2. Firebase setup (all done from a phone browser at console.firebase.google.com)

1. **Create a project**: Firebase Console → Add project → name it (e.g.
   "vertex-theory") → skip Google Analytics or enable it, your choice.
2. **Add a Web app**: Project overview → the `</>` icon → register app
   (no need to check "Firebase Hosting", you're using Vercel) → copy the
   `firebaseConfig` object it shows you.
3. **Paste that config** into `firebase-config.js` in this project, replacing
   the `PASTE_...` placeholders.
4. **Enable Firestore**: Build → Firestore Database → Create database →
   start in **production mode** → pick a region close to your audience.
5. **Publish security rules**: Firestore Database → Rules tab → replace
   everything with the contents of `firestore.rules` in this project →
   Publish.
6. **Enable Authentication**: Build → Authentication → Get started → enable
   the **Email/Password** provider.
7. **Create your admin account**: Authentication → Users → Add user → enter
   the email/password you'll use to log into `/admin.html`. There's no
   public sign-up page — this is the only way an account gets created.
8. **(Optional) Enable Analytics/GA4**: if you enabled Analytics in step 1,
   grab the `measurementId` (starts with `G-`) from Project settings and
   paste it into `firebase-config.js` too.

Firestore is force-initialized with `experimentalForceLongPolling: true` in
`firebase-config.js` — this keeps it working inside restricted in-app
WebViews (Facebook, Instagram, LinkedIn browsers) that otherwise silently
fail to open a normal streaming connection.

---

## 3. Deploy from mobile (GitHub + Vercel)

1. **Create a new GitHub repo** from the GitHub mobile app or github.com in
   Safari/Chrome (e.g. `vertex-theory`).
2. **Get the files into the repo.** From a mobile Git client (Working Copy
   on iOS, or GitHub's own "Add file → Upload files" web UI works fine from
   a phone browser too):
   - Clone/create the repo.
   - Copy every file from this `vertex-theory/` folder into the repo root
     (keep it flat — don't nest it inside another folder).
   - Commit and push.
3. **Connect Vercel**: go to vercel.com in your mobile browser → Add New →
   Project → Import your GitHub repo (authorize Vercel's GitHub App if it's
   your first time — one-tap OAuth flow).
4. **Framework preset**: choose **"Other"** (this is a static site, no
   framework, no build command needed). Leave Build Command and Output
   Directory empty/default — Vercel will just serve the files as-is.
5. **Deploy.** Vercel gives you a `*.vercel.app` URL immediately. Add a
   custom domain later from Project → Settings → Domains, same mobile
   dashboard.
6. **Every future push to your main branch auto-deploys** — no redeploy step
   needed for content changes, since posts/settings live in Firestore, not
   in the repo.

### Steps that specifically need a desktop (flagging as requested)

Honestly — none of them do. Everything above (repo creation, file upload,
Firebase Console configuration, Vercel import/deploy, and the admin panel
itself) works in a mobile browser or a mobile Git client. The one place you
might *prefer* a desktop, purely for comfort, is writing long post bodies in
the Admin → Post Editor textarea — typing HTML on a phone keyboard is
tedious. `STARTER-CONTENT.md` in this repo has three full sample posts
pre-written so you can paste instead of type to get started, and you can
always draft long posts in Notes/Google Docs and paste the HTML in.

---

## 4. Seeding content

Open `/admin.html`, sign in, go to **Post Editor → + New post**, and paste in
the fields from `STARTER-CONTENT.md`. Set Status to **Published** and Save.
Do this for all three, mark one as **Featured**, and your homepage goes from
an empty state to a real-looking blog in about five minutes.

The About page already ships with real default copy (see `about.html`), so
you don't need to touch Appearance → About unless you want to change it —
when you do, it overrides the default without a redeploy.

---

## 5. Routing notes

- Routing is query-param based (`/?post=slug-here`, `/?category=money`), not
  hash-based (`#/post/...`) — hash fragments get stripped by the Facebook
  in-app browser and some other in-app WebViews, which breaks shared links.
  Every param is read with `URLSearchParams`, which safely ignores whatever
  extra tracking params get appended (`fbclid`, `utm_*`, `igshid`, etc.).
- **Known limitation — social link previews:** because this is a
  client-rendered static site, the Open Graph tags on `post.html` are
  updated by JavaScript *after* the page loads. Real browsers see this fine,
  but most social crawlers (notably Facebook's) don't execute JavaScript, so
  a freshly shared post link may show the generic site preview instead of
  that post's title/image until the crawler happens to pick up a cached
  render. If per-post link previews become important, the fix is a small
  Vercel serverless function (a single file in an `/api` folder, no build
  step) that fetches the post from Firestore server-side and returns
  pre-rendered HTML with the right `<meta>` tags for known crawler user
  agents — happy to build that as a follow-up if you want it.

---

## 6. Imgur images

Paste either a share link (`imgur.com/abc123`) or a direct link
(`i.imgur.com/abc123.jpg`) into the Cover Image field or an `<img src="...">`
in the post body — both the editor (on save) and the post page (on render,
as a safety net) auto-convert share links to direct image URLs, so they
render as actual images instead of a broken link icon.
