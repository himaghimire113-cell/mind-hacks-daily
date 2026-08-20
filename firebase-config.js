// =============================================================================
// VERTEX THEORY — Firebase configuration
// -----------------------------------------------------------------------------
// Fill in the values below from Firebase Console → Project settings →
// "Your apps" → SDK setup and configuration → Config.
// This file is safe to expose publicly (it's not a secret — access is
// controlled by Firestore Security Rules, see firestore.rules).
// =============================================================================

export const firebaseConfig = {
  apiKey: "PASTE_API_KEY_HERE",
  authDomain: "PASTE_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_PROJECT_ID.appspot.com",
  messagingSenderId: "PASTE_SENDER_ID",
  appId: "PASTE_APP_ID",
  measurementId: "PASTE_G-MEASUREMENT_ID" // optional, for GA4
};

// -----------------------------------------------------------------------------
// Shared Firebase app + Firestore + Auth instances.
// Firestore is force-initialized on long-polling so it works reliably inside
// restricted in-app WebViews (Facebook, Instagram, LinkedIn browsers), which
// otherwise silently fail to open a WebChannel/streaming connection.
// -----------------------------------------------------------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  initializeFirestore,
  CACHE_SIZE_UNLIMITED
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

export const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

export const auth = getAuth(app);

// Analytics only loads in browsers that support it (skips unsupported
// in-app WebViews instead of throwing).
export let analytics = null;
isSupported().then((supported) => {
  if (supported && firebaseConfig.measurementId && !firebaseConfig.measurementId.startsWith("PASTE")) {
    analytics = getAnalytics(app);
  }
});
