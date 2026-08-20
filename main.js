import { db } from "./firebase-config.js";
import { mountLayout } from "./partials.js";
import { getParam, buildUrl, escapeHtml, formatDate } from "./utils.js";
import {
  collection, query, where, orderBy, limit, getDocs, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

mountLayout();

const grid = document.getElementById("post-grid");
const featuredSlot = document.getElementById("featured-slot");
const emptyState = document.getElementById("post-empty");
const filterLabel = document.getElementById("filter-label");
const listingHeading = document.getElementById("listing-heading");

const category = getParam("category");

if (category) {
  listingHeading.textContent = `Filed under: ${category}`;
  filterLabel.innerHTML = `<a href="/" style="text-decoration:underline;">Clear filter</a>`;
} else {
  filterLabel.textContent = "";
}

renderSkeleton();
loadPosts();

function renderSkeleton() {
  grid.innerHTML = Array.from({ length: 6 }).map(() => `
    <div class="post-card">
      <div class="post-card-thumb skeleton"></div>
      <div class="skeleton" style="height:20px;width:80%;"></div>
      <div class="skeleton" style="height:14px;width:100%;"></div>
    </div>
  `).join("");
}

async function loadPosts() {
  try {
    const postsRef = collection(db, "posts");
    const clauses = [where("status", "==", "published")];
    if (category) clauses.push(where("category", "==", category));
    clauses.push(orderBy("publishedAt", "desc"));
    clauses.push(limit(31));

    const snap = await getDocs(query(postsRef, ...clauses));
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (posts.length === 0) {
      grid.innerHTML = "";
      showEmptyState();
      return;
    }

    let listPosts = posts;
    if (!category && posts.length > 1) {
      const featured = posts.find((p) => p.featured) || posts[0];
      listPosts = posts.filter((p) => p.id !== featured.id);
      featuredSlot.innerHTML = renderFeatured(featured);
    }

    grid.innerHTML = listPosts.map(renderCard).join("");
  } catch (err) {
    console.error("Failed to load posts:", err);
    grid.innerHTML = "";
    showEmptyState(true);
  }
}

function showEmptyState(isError = false) {
  emptyState.hidden = false;
  emptyState.innerHTML = isError
    ? `<div class="empty-state">
         <h3>Couldn't load posts right now</h3>
         <p>Check your Firebase config in <code>firebase-config.js</code>, or try again in a moment.</p>
       </div>`
    : `<div class="empty-state">
         <h3>Nothing published here yet</h3>
         <p>Once you publish your first post from <a href="/admin.html" style="text-decoration:underline;">the admin panel</a>, it'll show up here.</p>
       </div>`;
}

function renderFeatured(post) {
  const thumb = post.coverImage
    ? `<img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" loading="eager" />`
    : "";
  return `
    <article class="featured-post">
      <a class="post-card-thumb ${post.coverImage ? "" : "is-empty"}" href="${buildUrl("post", post.slug)}" aria-hidden="true" tabindex="-1">
        ${thumb || vertexPlaceholderSvg()}
      </a>
      <div class="stack gap-3">
        <span class="eyebrow">Featured</span>
        <h2><a href="${buildUrl("post", post.slug)}">${escapeHtml(post.title)}</a></h2>
        <p class="excerpt" style="font-size:1.02rem;">${escapeHtml(post.excerpt || "")}</p>
        <div class="tag-row">${(post.tags || []).slice(0, 3).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
        <span class="meta">${formatDate(post.publishedAt)}</span>
      </div>
    </article>
  `;
}

function renderCard(post) {
  const thumb = post.coverImage
    ? `<img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" loading="lazy" />`
    : vertexPlaceholderSvg();
  return `
    <article class="post-card">
      <a class="post-card-thumb ${post.coverImage ? "" : "is-empty"}" href="${buildUrl("post", post.slug)}" aria-hidden="true" tabindex="-1">
        ${thumb}
      </a>
      <div class="tag-row">${(post.tags || []).slice(0, 2).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      <h3><a href="${buildUrl("post", post.slug)}">${escapeHtml(post.title)}</a></h3>
      <p class="excerpt">${escapeHtml(post.excerpt || "")}</p>
      <span class="meta">${formatDate(post.publishedAt)}</span>
    </article>
  `;
}

function vertexPlaceholderSvg() {
  return `<svg width="40" height="40" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M16 5 L27 25 H5 Z" stroke="#C9C4B6" stroke-width="2" stroke-linejoin="round" fill="none"/>
  </svg>`;
}

// --------------------------- Newsletter signup ------------------------------
const form = document.getElementById("newsletter-form");
const status = document.getElementById("newsletter-status");
const submitBtn = document.getElementById("newsletter-submit");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("newsletter-email").value.trim();
  if (!isValidEmail(email)) {
    setStatus("Enter a valid email address.", true);
    return;
  }
  submitBtn.disabled = true;
  submitBtn.textContent = "Subscribing…";
  try {
    await addDoc(collection(db, "subscribers"), {
      email,
      subscribedAt: serverTimestamp(),
      source: "homepage"
    });
    form.reset();
    setStatus("You're on the list. Look out for the next essay.", false);
  } catch (err) {
    console.error("Subscribe failed:", err);
    setStatus("Something went wrong — try again in a moment.", true);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Subscribe";
  }
});

function setStatus(message, isError) {
  status.textContent = message;
  status.className = "form-status " + (isError ? "is-error" : "is-success");
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
