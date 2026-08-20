// ============================================================
// VERTEX THEORY — Firebase configuration
// Paste your own project's config values below. You get these
// from Firebase Console → Project settings → General → "Your apps"
// → SDK setup and configuration → Config.
// See README.md for the full step-by-step walkthrough.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getAnalytics, isSupported as analyticsSupported } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-analytics.js";

// ---- REPLACE THESE VALUES with your own Firebase project config ----
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "G-YOUR_MEASUREMENT_ID" // optional, only needed for Analytics
};
// ----------------------------------------------------------------------

export const app = initializeApp(firebaseConfig);

// Long-polling is forced on so Firestore keeps working inside restricted
// in-app browsers (Facebook, Instagram, Messenger) where WebSockets /
// streaming fetch are often blocked.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

export const auth = getAuth(app);

// Analytics only initializes in real browsers that support it (it throws
// inside some in-app webviews / SSR-like contexts), so guard it.
export let analytics = null;
analyticsSupported().then((ok) => {
  if (ok) analytics = getAnalytics(app);
}).catch(() => {});
