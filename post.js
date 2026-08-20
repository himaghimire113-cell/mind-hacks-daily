import { db } from "./firebase-config.js";
import { mountLayout } from "./partials.js";
import { getParam, escapeHtml, formatDate, readingTime, toDirectImageUrl } from "./utils.js";
import {
  collection, query, where, limit, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

mountLayout();

// Defensive param parsing: URLSearchParams ignores any other params Facebook
// or other apps append (fbclid, utm_*, igshid, etc.) — we only ever read "post".
const slug = getParam("post");

const loadingEl = document.getElementById("post-loading");
const contentEl = document.getElementById("post-content");
const notFoundEl = document.getElementById("post-not-found");

if (!slug) {
  showNotFound();
} else {
  loadPost(slug);
}

async function loadPost(postSlug) {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("slug", "==", postSlug),
      where("status", "==", "published"),
      limit(1)
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      showNotFound();
      return;
    }

    const post = snap.docs[0].data();
    renderPost(post);
  } catch (err) {
    console.error("Failed to load post:", err);
    showNotFound();
  }
}

function renderPost(post) {
  loadingEl.hidden = true;
  contentEl.hidden = false;

  document.getElementById("post-title").textContent = post.title || "Untitled";
  document.getElementById("post-date").textContent = formatDate(post.publishedAt);
  document.getElementById("post-reading-time").textContent = readingTime(post.body);

  const tagsEl = document.getElementById("post-tags");
  tagsEl.innerHTML = (post.tags || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");

  const coverUrl = toDirectImageUrl(post.coverImage);
  if (coverUrl) {
    const coverWrap = document.getElementById("post-cover");
    const coverImg = document.getElementById("post-cover-img");
    coverWrap.hidden = false;
    coverImg.src = coverUrl;
    coverImg.alt = post.title || "";
  }

  // Post body is HTML written by the site owner in the admin editor (not
  // public user input), so it's rendered as-is. Any Imgur share links inside
  // <img> tags should already be stored as direct URLs by the editor's
  // auto-convert step, but we normalize again here as a safety net.
  const bodyEl = document.getElementById("post-body");
  bodyEl.innerHTML = normalizeImagesInHtml(post.body || "");

  document.title = `${post.title} — Vertex Theory`;
  setMeta("meta-description", "content", post.excerpt || "");
  setMeta("og-title", "content", post.title || "Vertex Theory");
  setMeta("og-description", "content", post.excerpt || "");
  setMeta("og-image", "content", coverUrl || "/og-default.png");
  setMeta("og-url", "content", window.location.href);
  document.getElementById("doc-title").textContent = `${post.title} — Vertex Theory`;
}

function normalizeImagesInHtml(html) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.querySelectorAll("img[src]").forEach((img) => {
    img.setAttribute("src", toDirectImageUrl(img.getAttribute("src")));
    img.setAttribute("loading", "lazy");
  });
  return wrapper.innerHTML;
}

function setMeta(id, attr, value) {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

function showNotFound() {
  loadingEl.hidden = true;
  notFoundEl.hidden = false;
}

// --------------------------- Newsletter signup ------------------------------
const form = document.getElementById("newsletter-form");
if (form) {
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
        source: `post:${slug || "unknown"}`
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
}
