# Vertex Theory

Mobile-first static blog using vanilla HTML/CSS/JS + Firebase Firestore/Auth/Analytics. No npm, no build step.

## Files
- `index.html` public site shell
- `styles.css` design system and responsive layout
- `app.js` public Firestore data loading, query-param routing, newsletter signup, Motion animation-ready frontend
- `admin.html` Firebase Auth admin UI
- `admin.js` post editor, appearance and subscribers
- `firebase-config.js` Firebase web config
- `firestore.rules` security rules
- `vercel.json` simple production headers

## Firebase setup
1. Create a Firebase project.
2. Add a Web App and copy its config into `firebase-config.js`.
3. Enable Firestore Database.
4. Enable Authentication > Sign-in method > Email/Password.
5. Create your admin user in Authentication > Users.
6. Replace `YOUR_ADMIN_EMAIL` in both `admin.js` and `firestore.rules` with that exact admin email.
7. Paste `firestore.rules` into Firestore Database > Rules and Publish.
8. Create Firestore document `settings/site` with:
   - `siteTitle`: `Vertex Theory`
   - `description`: `Ideas worth thinking about. Stories worth remembering.`
   - `accent`: `#c64b2d`
   - `accent2`: `#243d35`
9. Create a `posts` collection by adding your first document through the admin panel after signing in.
10. Add Firebase Analytics by ensuring the config includes `measurementId`.

## URL routing
- Home: `/?page=home`
- Article: `/?post=your-slug`
- Category: `/?category=Finance`
- About: `/?page=about`
- Privacy: `/?page=privacy`
- Admin: `/admin.html`

`URLSearchParams` ignores Facebook's `fbclid` automatically because the app only reads `post`, `category`, and `page`.

## Motion
The public site is deliberately buildless. Motion can be loaded from its ESM CDN when you want richer animation:
`https://cdn.jsdelivr.net/npm/motion@latest/+esm`
This keeps the iPhone/Vercel workflow free of npm and bundling.

## Important social preview limitation
A purely static browser app cannot fetch a different Firestore post and rewrite Open Graph tags before Facebook's crawler requests the HTML. The browser updates `og:title`, `og:description`, and `og:image` after loading, which helps normal browsers, but Facebook link previews may use the generic `index.html` metadata.

For guaranteed per-post Facebook previews, add a tiny Vercel serverless/edge endpoint that reads the post and returns HTML metadata. That is the one optional step that moves beyond a strictly static site.

## Likes, comments and sharing

The public article page now includes:
- one-like-per-anonymous-visitor-per-post using Firebase Anonymous Authentication
- moderated comments stored under `posts/{postId}/comments`
- share buttons for native mobile sharing, Facebook, WhatsApp, X and copy link
- live Firestore counts for likes, comments and shares
- client-side cooldowns plus Firestore field validation for basic abuse protection

### Required Firebase change
Enable **Authentication → Sign-in method → Anonymous**. Anonymous Authentication is used so readers can receive a stable Firebase UID without creating an account. This UID is used to prevent a visitor from repeatedly liking the same post.

### Admin moderation
Open `/admin.html`, sign in with the configured administrator account, then open **Comments**. Approve a comment to make it public or delete it permanently.

### Firestore rules
Paste the updated `firestore.rules` into Firebase Console → Firestore Database → Rules. Replace `YOUR_ADMIN_EMAIL` with your administrator email before publishing.

### Important abuse note
The site includes practical basic protection, not a full anti-spam service. A determined bot can still abuse public endpoints. For a larger audience, add App Check and/or a server-side moderation/rate-limit layer.
