import { db, auth } from "./firebase-config.js";
import { slugify, toDirectImageUrl, escapeHtml, formatDate } from "./utils.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, orderBy, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// =============================================================================
// AUTH
// =============================================================================
const loginScreen = document.getElementById("login-screen");
const adminApp = document.getElementById("admin-app");
const loginForm = document.getElementById("login-form");
const loginError = document.getElementById("login-error");
const loginSubmit = document.getElementById("login-submit");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";
  loginSubmit.disabled = true;
  loginSubmit.textContent = "Signing in…";
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    loginError.textContent = friendlyAuthError(err.code);
  } finally {
    loginSubmit.disabled = false;
    loginSubmit.textContent = "Sign in";
  }
});

document.getElementById("logout-btn").addEventListener("click", () => signOut(auth));

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginScreen.hidden = true;
    adminApp.hidden = false;
    document.getElementById("current-user-email").textContent = user.email;
    initAdminApp();
  } else {
    loginScreen.hidden = false;
    adminApp.hidden = true;
  }
});

function friendlyAuthError(code) {
  switch (code) {
    case "auth/invalid-email": return "That email address doesn't look right.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Incorrect email or password.";
    case "auth/too-many-requests": return "Too many attempts — wait a bit and try again.";
    default: return "Couldn't sign in. Check your connection and try again.";
  }
}

// Everything below only runs after a successful login, and only wires up once.
let appInitialized = false;
function initAdminApp() {
  if (appInitialized) return;
  appInitialized = true;
  initTabs();
  initPostsPanel();
  initAppearancePanel();
  initSubscribersPanel();
}

// =============================================================================
// TABS
// =============================================================================
function initTabs() {
  const tabs = document.querySelectorAll(".admin-tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => { t.classList.remove("is-active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      document.querySelectorAll(".admin-panel").forEach((p) => { p.hidden = true; p.classList.remove("is-active"); });
      const panel = document.getElementById(`panel-${tab.dataset.tab}`);
      panel.hidden = false;
      panel.classList.add("is-active");
    });
  });
}

// =============================================================================
// POSTS
// =============================================================================
let allPosts = [];
let selectedPostId = null;

function initPostsPanel() {
  loadPosts();

  document.getElementById("new-post-btn").addEventListener("click", () => selectPost(null));
  document.getElementById("post-cancel-btn").addEventListener("click", () => selectPost(null));
  document.getElementById("post-search").addEventListener("input", (e) => renderPostsList(e.target.value));

  const titleInput = document.getElementById("post-title");
  const slugInput = document.getElementById("post-slug");
  const slugPreview = document.getElementById("slug-preview");
  titleInput.addEventListener("input", () => {
    if (!slugInput.dataset.manuallyEdited) {
      slugInput.value = slugify(titleInput.value);
      slugPreview.textContent = slugInput.value || "your-slug";
    }
  });
  slugInput.addEventListener("input", () => {
    slugInput.dataset.manuallyEdited = "true";
    slugPreview.textContent = slugify(slugInput.value) || "your-slug";
  });

  document.getElementById("post-form").addEventListener("submit", savePost);
  document.getElementById("post-delete-btn").addEventListener("click", deleteSelectedPost);
}

async function loadPosts() {
  const listEl = document.getElementById("posts-list");
  listEl.innerHTML = `<p class="text-muted" style="padding:12px;">Loading…</p>`;
  try {
    const snap = await getDocs(query(collection(db, "posts"), orderBy("updatedAt", "desc")));
    allPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderPostsList();
  } catch (err) {
    console.error(err);
    listEl.innerHTML = `<p class="field-error" style="padding:12px;">Couldn't load posts: ${escapeHtml(err.message)}</p>`;
  }
}

function renderPostsList(filterText = "") {
  const listEl = document.getElementById("posts-list");
  const filtered = filterText
    ? allPosts.filter((p) => (p.title || "").toLowerCase().includes(filterText.toLowerCase()))
    : allPosts;

  if (filtered.length === 0) {
    listEl.innerHTML = `<p class="text-muted" style="padding:12px;">No posts yet. Click "+ New post" to write your first one.</p>`;
    return;
  }

  listEl.innerHTML = filtered.map((p) => `
    <button type="button" class="post-list-item ${p.id === selectedPostId ? "is-selected" : ""}" data-id="${p.id}">
      <span class="plt">${escapeHtml(p.title || "Untitled")}</span>
      <span class="pls">
        <span class="status-pill ${p.status === "published" ? "published" : "draft"}">${p.status || "draft"}</span>
        <span class="meta">${formatDate(p.updatedAt)}</span>
      </span>
    </button>
  `).join("");

  listEl.querySelectorAll(".post-list-item").forEach((btn) => {
    btn.addEventListener("click", () => selectPost(btn.dataset.id));
  });
}

function selectPost(id) {
  selectedPostId = id;
  const form = document.getElementById("post-form");
  const deleteBtn = document.getElementById("post-delete-btn");
  const slugInput = document.getElementById("post-slug");
  document.getElementById("post-error").textContent = "";

  if (!id) {
    form.reset();
    document.getElementById("post-id").value = "";
    slugInput.dataset.manuallyEdited = "";
    document.getElementById("slug-preview").textContent = "your-slug";
    deleteBtn.hidden = true;
  } else {
    const post = allPosts.find((p) => p.id === id);
    if (!post) return;
    document.getElementById("post-id").value = id;
    document.getElementById("post-title").value = post.title || "";
    document.getElementById("post-slug").value = post.slug || "";
    slugInput.dataset.manuallyEdited = "true";
    document.getElementById("slug-preview").textContent = post.slug || "your-slug";
    document.getElementById("post-status").value = post.status || "draft";
    document.getElementById("post-category").value = post.category || "";
    document.getElementById("post-tags").value = (post.tags || []).join(", ");
    document.getElementById("post-image").value = post.coverImage || "";
    document.getElementById("post-excerpt").value = post.excerpt || "";
    document.getElementById("post-body").value = post.body || "";
    document.getElementById("post-featured").checked = !!post.featured;
    deleteBtn.hidden = false;
  }

  renderPostsList(document.getElementById("post-search").value);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function savePost(e) {
  e.preventDefault();
  const errorEl = document.getElementById("post-error");
  const saveBtn = document.getElementById("post-save-btn");
  errorEl.textContent = "";

  const title = document.getElementById("post-title").value.trim();
  const slug = slugify(document.getElementById("post-slug").value || title);
  if (!title || !slug) {
    errorEl.textContent = "Title (and a resulting slug) are required.";
    return;
  }

  const duplicate = allPosts.find((p) => p.slug === slug && p.id !== selectedPostId);
  if (duplicate) {
    errorEl.textContent = `Another post already uses the slug "${slug}". Edit the slug to make it unique.`;
    return;
  }

  const data = {
    title,
    slug,
    status: document.getElementById("post-status").value,
    category: document.getElementById("post-category").value.trim().toLowerCase(),
    tags: document.getElementById("post-tags").value.split(",").map((t) => t.trim()).filter(Boolean),
    coverImage: toDirectImageUrl(document.getElementById("post-image").value.trim()),
    excerpt: document.getElementById("post-excerpt").value.trim(),
    body: normalizeImagesInBodyHtml(document.getElementById("post-body").value),
    featured: document.getElementById("post-featured").checked,
    updatedAt: serverTimestamp()
  };

  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";
  try {
    if (selectedPostId) {
      await updateDoc(doc(db, "posts", selectedPostId), data);
      if (data.status === "published") {
        const existing = allPosts.find((p) => p.id === selectedPostId);
        if (!existing?.publishedAt) {
          await updateDoc(doc(db, "posts", selectedPostId), { publishedAt: serverTimestamp() });
        }
      }
    } else {
      data.createdAt = serverTimestamp();
      if (data.status === "published") data.publishedAt = serverTimestamp();
      const ref = await addDoc(collection(db, "posts"), data);
      selectedPostId = ref.id;
    }
    await loadPosts();
    selectPost(selectedPostId);
    flashSaved(saveBtn);
  } catch (err) {
    console.error(err);
    errorEl.textContent = "Couldn't save: " + err.message;
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save post";
  }
}

function normalizeImagesInBodyHtml(html) {
  // Convert any bare Imgur URLs used as <img src="..."> to direct links.
  return html.replace(/(<img[^>]+src=["'])([^"']+)(["'])/gi, (match, pre, url, post) => {
    return pre + toDirectImageUrl(url) + post;
  });
}

async function deleteSelectedPost() {
  if (!selectedPostId) return;
  const post = allPosts.find((p) => p.id === selectedPostId);
  const confirmed = window.confirm(`Delete "${post?.title || "this post"}"? This can't be undone.`);
  if (!confirmed) return;
  try {
    await deleteDoc(doc(db, "posts", selectedPostId));
    selectedPostId = null;
    await loadPosts();
    selectPost(null);
  } catch (err) {
    document.getElementById("post-error").textContent = "Couldn't delete: " + err.message;
  }
}

function flashSaved(btn) {
  const original = btn.textContent;
  btn.textContent = "Saved ✓";
  setTimeout(() => { btn.textContent = original; }, 1400);
}

// =============================================================================
// APPEARANCE
// =============================================================================
function initAppearancePanel() {
  loadAppearance();
  document.getElementById("appearance-form").addEventListener("submit", saveAppearance);
}

async function loadAppearance() {
  try {
    const siteSnap = await getDoc(doc(db, "settings", "site"));
    if (siteSnap.exists()) {
      const s = siteSnap.data();
      document.getElementById("site-title").value = s.siteTitle || "";
      document.getElementById("site-tagline").value = s.tagline || "";
      document.getElementById("site-accent").value = s.accentColor || "";
    }
    const aboutSnap = await getDoc(doc(db, "settings", "about"));
    if (aboutSnap.exists()) {
      document.getElementById("about-body-html").value = aboutSnap.data().bodyHtml || "";
    }
  } catch (err) {
    console.error("Couldn't load appearance settings:", err);
  }
}

async function saveAppearance(e) {
  e.preventDefault();
  const errorEl = document.getElementById("appearance-error");
  const statusEl = document.getElementById("appearance-status");
  const btn = document.getElementById("appearance-save-btn");
  errorEl.textContent = "";
  statusEl.textContent = "";
  btn.disabled = true;
  btn.textContent = "Saving…";

  try {
    await setDoc(doc(db, "settings", "site"), {
      siteTitle: document.getElementById("site-title").value.trim(),
      tagline: document.getElementById("site-tagline").value.trim(),
      accentColor: document.getElementById("site-accent").value.trim(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    await setDoc(doc(db, "settings", "about"), {
      bodyHtml: document.getElementById("about-body-html").value,
      updatedAt: serverTimestamp()
    }, { merge: true });

    statusEl.textContent = "Saved — changes are live now.";
    statusEl.className = "form-status is-success";
  } catch (err) {
    errorEl.textContent = "Couldn't save: " + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = "Save settings";
  }
}

// =============================================================================
// SUBSCRIBERS
// =============================================================================
let allSubscribers = [];

function initSubscribersPanel() {
  loadSubscribers();
  document.getElementById("export-subscribers-btn").addEventListener("click", exportSubscribersCsv);
}

async function loadSubscribers() {
  const tbody = document.getElementById("subscribers-tbody");
  const countEl = document.getElementById("subscriber-count");
  const emptyEl = document.getElementById("subscribers-empty");
  try {
    const snap = await getDocs(query(collection(db, "subscribers"), orderBy("subscribedAt", "desc")));
    allSubscribers = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    countEl.textContent = `${allSubscribers.length} subscriber${allSubscribers.length === 1 ? "" : "s"}`;

    if (allSubscribers.length === 0) {
      tbody.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;

    tbody.innerHTML = allSubscribers.map((s) => `
      <tr>
        <td>${escapeHtml(s.email)}</td>
        <td>${formatDate(s.subscribedAt)}</td>
        <td>${escapeHtml(s.source || "—")}</td>
        <td><button class="row-delete" data-id="${s.id}">Remove</button></td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".row-delete").forEach((btn) => {
      btn.addEventListener("click", () => removeSubscriber(btn.dataset.id));
    });
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="4" class="field-error">Couldn't load subscribers: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function removeSubscriber(id) {
  const confirmed = window.confirm("Remove this subscriber?");
  if (!confirmed) return;
  try {
    await deleteDoc(doc(db, "subscribers", id));
    await loadSubscribers();
  } catch (err) {
    alert("Couldn't remove subscriber: " + err.message);
  }
}

function exportSubscribersCsv() {
  if (allSubscribers.length === 0) return;
  const rows = [["email", "subscribed_at", "source"]];
  allSubscribers.forEach((s) => {
    rows.push([s.email, formatDate(s.subscribedAt), s.source || ""]);
  });
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vertex-theory-subscribers-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
