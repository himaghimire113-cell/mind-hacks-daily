# Vertex Theory — Mobile Deploy

Flat, build-free static blog for iPhone → GitHub → Vercel.

## IMPORTANT FIX

The previous build imported Motion as a required module during startup. If the CDN/module failed to load in a restricted browser, the entire site stopped rendering. This version loads Motion optionally after startup, so the website still works if the animation CDN is unavailable.

The site still uses Motion from CDN when it is available.

## Firebase

1. Create a Firebase project.
2. Add a Web App.
3. Enable Firestore Database.
4. Enable Authentication → Sign-in method → Email/Password.
5. Enable Authentication → Sign-in method → Anonymous.
6. Enable Analytics if desired.
7. Put your Firebase Web App values in `firebase-config.js`.
8. Replace `YOUR_ADMIN_EMAIL` in `admin.js` and `firestore.rules` with your exact admin email.
9. Paste `firestore.rules` into Firestore → Rules and publish.

## Firebase config

Replace the values in `firebase-config.js` with the config Firebase gives you. The Firebase web config is intended to be present in browser code. Security comes from Firestore Rules, not hiding these values.

## Vercel

No build command. No output directory. Import the GitHub repository into Vercel and deploy as a static site.

## URL routing

- Home: `/?page=home`
- Article: `/?post=article-slug`
- Category: `/?category=Finance`
- About: `/?page=about`
- Privacy: `/?page=privacy`
- Admin: `/admin.html`

URLSearchParams is used, so Facebook `fbclid` parameters are ignored safely.

## Imgur

Paste an Imgur share URL such as `https://imgur.com/ABC123` into the image field. The editor converts it to an `i.imgur.com` direct image URL before saving.

## Social features

- Likes: anonymous Firebase Auth + Firestore subcollection
- Comments: pending moderation
- Shares: native share, Facebook, WhatsApp, X, copy link
- Counters: Firestore counts
- Basic client-side rate limits and Firestore validation

## Desktop requirement

None for normal deployment. iPhone + GitHub mobile/client + Vercel mobile dashboard are sufficient.
