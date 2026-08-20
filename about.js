import { db } from "./firebase-config.js";
import { mountLayout } from "./partials.js";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

mountLayout();

// The About page ships with real default copy above (in about.html) so it
// looks right immediately. If you edit the About text from Admin →
// Appearance, that saved version — stored at settings/about — takes over
// here without needing a redeploy.
(async () => {
  try {
    const snap = await getDoc(doc(db, "settings", "about"));
    if (snap.exists() && snap.data().bodyHtml) {
      document.getElementById("about-body").innerHTML = snap.data().bodyHtml;
    }
  } catch (err) {
    // Firestore not configured yet, or offline — keep the default copy.
    console.info("Using default About copy (settings/about not available):", err.message);
  }
})();

// --------------------------- Newsletter signup ------------------------------
const form = document.getElementById("newsletter-form");
const status = document.getElementById("newsletter-status");
const submitBtn = document.getElementById("newsletter-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("newsletter-email").value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    status.textContent = "Enter a valid email address.";
    status.className = "form-status is-error";
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = "Subscribing…";
  try {
    await addDoc(collection(db, "subscribers"), {
      email,
      subscribedAt: serverTimestamp(),
      source: "about"
    });
    form.reset();
    status.textContent = "You're on the list. Look out for the next essay.";
    status.className = "form-status is-success";
  } catch (err) {
    console.error("Subscribe failed:", err);
    status.textContent = "Something went wrong — try again in a moment.";
    status.className = "form-status is-error";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Subscribe";
  }
});
