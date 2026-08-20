// ============================================================
// VERTEX THEORY — admin panel logic
// Requires a Firebase Auth user to be created in advance
// (Firebase Console → Authentication → Users → Add user).
// ============================================================
import { db, auth } from "./firebase-config.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, setDoc,
  query, orderBy, serverTimestamp, collectionGroup
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { computeReadTime, resolveImageUrl, slugify, formatDate, escapeHtml, toast } from "./app.js";

let allPosts = [];
let allSubscribers = [];
let allMessages = [];

/* ---------------- Auth gate ---------------- */
onAuthStateChanged(auth, (user) => {
  if (user){
    document.getElementById("admin-login").style.display = "none";
    document.getElementById("admin-shell").style.display = "flex";
    document.getElementById("topbar-user").textContent = user.email;
    boot();
  } else {
    document.getElementById("admin-login").style.display = "flex";
    document.getElementById("admin-shell").style.display = "none";
  }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const btn = document.getElementById("login-btn");
  const errBox = document.getElementById("login-error");
  errBox.classList.remove("show");
  btn.disabled = true;
  const original = btn.textContent;
  btn.innerHTML = `<span class="spin"></span>`;
  try{
    await signInWithEmailAndPassword(auth, email, password);
  }catch(err){
    errBox.textContent = "Sign-in failed — check your email and password.";
    errBox.classList.add("show");
  }finally{
    btn.disabled = false;
    btn.textContent = original;
  }
});

function wireLogout(){
  ["logout-btn", "logout-btn-mobile"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", () => signOut(auth));
  });
}

/* ---------------- Nav / tabs ---------------- */
function wireNav(){
  document.querySelectorAll("[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => switchView(btn.dataset.view));
  });
}
function switchView(view){
  document.querySelectorAll(".admin-view").forEach(v => v.classList.remove("active"));
  document.getElementById(`view-${view}`).classList.add("active");
  document.querySelectorAll("[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === view));
  const titles = { posts:"Posts", appearance:"Appearance", subscribers:"Subscribers", messages:"Messages" };
  document.getElementById("topbar-title").textContent = titles[view] || view;
}

let booted = false;
async function boot(){
  wireLogout();
  wireNav();
  wirePostEditor();
  wireAppearance();
  document.getElementById("export-csv-btn").addEventListener("click", exportSubscribersCSV);
  if (booted) return;
  booted = true;
  await Promise.all([loadPosts(), loadSubscribers(), loadMessages(), loadSettingsIntoForm()]);
}

/* ================= POSTS ================= */
async function loadPosts(){
  try{
    const snap = await getDocs(query(collection(db, "posts"), orderBy("createdAt", "desc")));
    allPosts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }catch(e){ console.error(e); allPosts = []; }
  renderPostsTable();
  renderPostStats();
  populateFeaturedSelect();
}

function renderPostStats(){
  const pub = allPosts.filter(p => p.status === "published").length;
  const draft = allPosts.length - pub;
  const totalLikes = allPosts.reduce((s,p) => s + (p.likes||0), 0);
  document.getElementById("post-stats").innerHTML = `
    <div class="stat-card"><div class="stat-num">${allPosts.length}</div><div class="stat-label">Total posts</div></div>
    <div class="stat-card"><div class="stat-num">${pub}</div><div class="stat-label">Published</div></div>
    <div class="stat-card"><div class="stat-num">${draft}</div><div class="stat-label">Drafts</div></div>
    <div class="stat-card"><div class="stat-num">${totalLikes}</div><div class="stat-label">Total likes</div></div>
  `;
}

function renderPostsTable(){
  const tbody = document.getElementById("posts-tbody");
  if (!allPosts.length){
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:var(--ink-faint)">No posts yet — create your first one.</td></tr>`;
    return;
  }
  tbody.innerHTML = allPosts.map(p => `
    <tr>
      <td style="max-width:280px"><strong>${escapeHtml(p.title)}</strong></td>
      <td>${escapeHtml(p.category || "—")}</td>
      <td><span class="status-pill ${p.status}">${p.status}</span></td>
      <td>${formatDate(p.createdAt)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-edit="${p.id}" aria-label="Edit" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
          </button>
          <a class="icon-btn" href="/post.html?post=${encodeURIComponent(p.slug)}" target="_blank" aria-label="View" title="View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>
          </a>
        </div>
      </td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => openEditor(btn.dataset.edit));
  });
}

function populateFeaturedSelect(){
  const sel = document.getElementById("set-featured");
  const current = sel.value;
  sel.innerHTML = `<option value="">— most recent —</option>` + allPosts
    .filter(p => p.status === "published")
    .map(p => `<option value="${escapeHtml(p.slug)}">${escapeHtml(p.title)}</option>`).join("");
  if (current) sel.value = current;
}

/* ---- Editor modal ---- */
const overlay = document.getElementById("editor-overlay");
function wirePostEditor(){
  document.getElementById("new-post-btn").addEventListener("click", () => openEditor(null));
  document.getElementById("editor-close").addEventListener("click", closeEditor);
  document.getElementById("editor-cancel-btn").addEventListener("click", closeEditor);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeEditor(); });

  document.getElementById("e-title").addEventListener("input", (e) => {
    const slugField = document.getElementById("e-slug");
    if (!slugField.dataset.touched) slugField.value = slugify(e.target.value);
  });
  document.getElementById("e-slug").addEventListener("input", (e) => { e.target.dataset.touched = "1"; });
  document.getElementById("e-body").addEventListener("input", (e) => {
    document.getElementById("e-readtime-hint").textContent = `Estimated read time: ${computeReadTime(e.target.value)} min`;
  });

  document.getElementById("editor-form").addEventListener("submit", savePost);
  document.getElementById("editor-delete-btn").addEventListener("click", deletePost);
}

function openEditor(id){
  const form = document.getElementById("editor-form");
  form.reset();
  document.getElementById("e-slug").dataset.touched = "";
  const deleteBtn = document.getElementById("editor-delete-btn");

  if (id){
    const p = allPosts.find(x => x.id === id);
    document.getElementById("editor-title").textContent = "Edit post";
    document.getElementById("e-id").value = id;
    document.getElementById("e-title").value = p.title || "";
    document.getElementById("e-slug").value = p.slug || "";
    document.getElementById("e-slug").dataset.touched = "1";
    document.getElementById("e-category").value = p.category || "";
    document.getElementById("e-author").value = p.author || "";
    document.getElementById("e-tags").value = (p.tags || []).join(", ");
    document.getElementById("e-image").value = p.image || "";
    document.getElementById("e-excerpt").value = p.excerpt || "";
    document.getElementById("e-body").value = p.body || "";
    document.getElementById("e-status").value = p.status || "draft";
    document.getElementById("e-readtime-hint").textContent = `Estimated read time: ${p.readTime || computeReadTime(p.body)} min`;
    deleteBtn.style.display = "inline-flex";
  } else {
    document.getElementById("editor-title").textContent = "New post";
    document.getElementById("e-id").value = "";
    deleteBtn.style.display = "none";
  }
  overlay.classList.add("open");
}

function closeEditor(){ overlay.classList.remove("open"); }

async function savePost(e){
  e.preventDefault();
  const id = document.getElementById("e-id").value;
  const btn = document.getElementById("editor-save-btn");
  const body = document.getElementById("e-body").value.trim();

  const data = {
    title: document.getElementById("e-title").value.trim(),
    slug: slugify(document.getElementById("e-slug").value.trim()),
    category: document.getElementById("e-category").value.trim(),
    author: document.getElementById("e-author").value.trim() || "Vertex Theory",
    tags: document.getElementById("e-tags").value.split(",").map(t => t.trim()).filter(Boolean),
    image: resolveImageUrl(document.getElementById("e-image").value.trim()),
    excerpt: document.getElementById("e-excerpt").value.trim(),
    body,
    readTime: computeReadTime(body),
    status: document.getElementById("e-status").value,
  };

  if (!data.slug){ toast("Please provide a valid slug", true); return; }

  const clash = allPosts.find(p => p.slug === data.slug && p.id !== id);
  if (clash){ toast("Another post already uses that slug", true); return; }

  btn.disabled = true;
  const original = btn.textContent;
  btn.innerHTML = `<span class="spin"></span>`;

  try{
    if (id){
      const existing = allPosts.find(p => p.id === id);
      const payload = { ...data, updatedAt: serverTimestamp() };
      if (data.status === "published" && existing.status !== "published"){
        payload.publishedAt = serverTimestamp();
      }
      await updateDoc(doc(db, "posts", id), payload);
    } else {
      await addDoc(collection(db, "posts"), {
        ...data,
        likes: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: data.status === "published" ? serverTimestamp() : null
      });
    }
    toast("Post saved");
    closeEditor();
    await loadPosts();
  }catch(err){
    console.error(err);
    toast("Couldn't save post — check your Firestore rules / connection", true);
  }finally{
    btn.disabled = false;
    btn.textContent = original;
  }
}

async function deletePost(){
  const id = document.getElementById("e-id").value;
  if (!id) return;
  if (!confirm("Delete this post? This can't be undone.")) return;
  try{
    await deleteDoc(doc(db, "posts", id));
    toast("Post deleted");
    closeEditor();
    await loadPosts();
  }catch(err){
    console.error(err);
    toast("Couldn't delete post", true);
  }
}

/* ================= APPEARANCE ================= */
function wireAppearance(){
  const pairs = [["set-gold-c","set-gold"], ["set-blue-c","set-blue"], ["set-coral-c","set-coral"]];
  pairs.forEach(([colorId, textId]) => {
    const colorEl = document.getElementById(colorId);
    const textEl = document.getElementById(textId);
    colorEl.addEventListener("input", () => textEl.value = colorEl.value);
    textEl.addEventListener("input", () => { if (/^#[0-9a-f]{6}$/i.test(textEl.value)) colorEl.value = textEl.value; });
  });
  document.getElementById("save-settings-btn").addEventListener("click", saveSettings);
}

async function loadSettingsIntoForm(){
  let s = {};
  try{
    const snap = await getDoc(doc(db, "settings", "site"));
    s = snap.exists() ? snap.data() : {};
  }catch(e){ console.error(e); }

  document.getElementById("set-title").value = s.siteTitle || "Vertex";
  document.getElementById("set-accent").value = s.siteTitleAccent || "Theory";
  document.getElementById("set-tagline").value = s.tagline || "Every story has a turning point.";
  document.getElementById("set-footer").value = s.footerNote || "Independent stories, told straight.";
  document.getElementById("set-gold").value = s.colorGold || "#D4A537";
  document.getElementById("set-gold-c").value = s.colorGold || "#D4A537";
  document.getElementById("set-blue").value = s.colorBlue || "#2F5D8A";
  document.getElementById("set-blue-c").value = s.colorBlue || "#2F5D8A";
  document.getElementById("set-coral").value = s.colorCoral || "#C6402F";
  document.getElementById("set-coral-c").value = s.colorCoral || "#C6402F";
  document.getElementById("set-featured").value = s.featuredPostSlug || "";
  document.getElementById("set-ad-name").value = s.adSponsorName || "Advertise here";
  document.getElementById("set-ad-text").value = s.adSponsorText || "Reach readers who read to the end. Get in touch to sponsor this space.";
  document.getElementById("set-ad-link").value = s.adSponsorLink || "";
}

async function saveSettings(){
  const btn = document.getElementById("save-settings-btn");
  btn.disabled = true;
  const original = btn.textContent;
  btn.innerHTML = `<span class="spin"></span>`;
  const payload = {
    siteTitle: document.getElementById("set-title").value.trim() || "Vertex",
    siteTitleAccent: document.getElementById("set-accent").value.trim() || "Theory",
    tagline: document.getElementById("set-tagline").value.trim(),
    footerNote: document.getElementById("set-footer").value.trim(),
    colorGold: document.getElementById("set-gold").value.trim(),
    colorBlue: document.getElementById("set-blue").value.trim(),
    colorCoral: document.getElementById("set-coral").value.trim(),
    featuredPostSlug: document.getElementById("set-featured").value,
    adSponsorName: document.getElementById("set-ad-name").value.trim(),
    adSponsorText: document.getElementById("set-ad-text").value.trim(),
    adSponsorLink: document.getElementById("set-ad-link").value.trim(),
    updatedAt: serverTimestamp()
  };
  try{
    await setDoc(doc(db, "settings", "site"), payload, { merge: true });
    toast("Appearance saved — live on the site now");
  }catch(err){
    console.error(err);
    toast("Couldn't save settings", true);
  }finally{
    btn.disabled = false;
    btn.textContent = original;
  }
}

/* ================= SUBSCRIBERS ================= */
async function loadSubscribers(){
  try{
    const snap = await getDocs(query(collection(db, "subscribers"), orderBy("createdAt", "desc")));
    allSubscribers = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }catch(e){ console.error(e); allSubscribers = []; }
  renderSubscribers();
}

function renderSubscribers(){
  document.getElementById("sub-stats").innerHTML = `
    <div class="stat-card"><div class="stat-num">${allSubscribers.length}</div><div class="stat-label">Total subscribers</div></div>
  `;
  const tbody = document.getElementById("subs-tbody");
  if (!allSubscribers.length){
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:30px;color:var(--ink-faint)">No subscribers yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = allSubscribers.map(s => `
    <tr>
      <td>${escapeHtml(s.email)}</td>
      <td>${escapeHtml(s.source || "—")}</td>
      <td>${formatDate(s.createdAt)}</td>
      <td><button class="icon-btn" data-del-sub="${s.id}" aria-label="Remove" title="Remove"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6"/></svg></button></td>
    </tr>
  `).join("");
  tbody.querySelectorAll("[data-del-sub]").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this subscriber?")) return;
      try{
        await deleteDoc(doc(db, "subscribers", btn.dataset.delSub));
        toast("Subscriber removed");
        await loadSubscribers();
      }catch(e){ toast("Couldn't remove subscriber", true); }
    });
  });
}

function exportSubscribersCSV(){
  if (!allSubscribers.length){ toast("No subscribers to export", true); return; }
  const rows = [["email","source","subscribed_at"]].concat(
    allSubscribers.map(s => [s.email, s.source || "", formatDate(s.createdAt)])
  );
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `vertex-theory-subscribers-${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/* ================= MESSAGES (post comments, incl. private notes) ================= */
async function loadMessages(){
  const mount = document.getElementById("messages-list");
  try{
    const snap = await getDocs(query(collectionGroup(db, "comments"), orderBy("createdAt", "desc")));
    allMessages = snap.docs.map(d => ({ id: d.id, ref: d.ref, ...d.data() }));
  }catch(e){
    console.error(e);
    mount.innerHTML = `<div class="empty-state"><p>Couldn't load messages. If this is your first time, Firestore may prompt you (in the browser console) to create a collection-group index for "comments" ordered by "createdAt" — click that link once, wait a minute, then reload.</p></div>`;
    return;
  }
  renderMessages();
}

function renderMessages(){
  const mount = document.getElementById("messages-list");
  if (!allMessages.length){
    mount.innerHTML = `<div class="empty-state"><p>No messages yet.</p></div>`;
    return;
  }
  const byPost = new Map();
  allMessages.forEach(m => {
    const key = m.postSlug || "unknown";
    if (!byPost.has(key)) byPost.set(key, { title: m.postTitle || key, items: [] });
    byPost.get(key).items.push(m);
  });

  mount.innerHTML = [...byPost.entries()].map(([slug, group]) => `
    <div class="msg-thread">
      <a class="msg-post-ref" href="/post.html?post=${encodeURIComponent(slug)}" target="_blank">${escapeHtml(group.title)} ↗</a>
      ${group.items.map(m => `
        <div class="comment ${m.isAdmin ? "is-admin" : ""}" style="margin-bottom:8px">
          <div class="comment-head">
            <span class="comment-name">${escapeHtml(m.name || "Reader")}</span>
            ${m.isAdmin ? `<span class="comment-badge">You replied</span>` : ""}
            <span class="comment-date">${formatDate(m.createdAt)}</span>
            ${m.email ? `<span class="comment-date">· ${escapeHtml(m.email)}</span>` : ""}
          </div>
          <p class="comment-text">${escapeHtml(m.text)}</p>
        </div>
      `).join("")}
      <div class="msg-reply-box">
        <input type="text" placeholder="Reply as Vertex Theory..." data-reply-slug="${escapeHtml(slug)}">
        <button class="btn btn-sm btn-primary" data-reply-btn="${escapeHtml(slug)}">Reply</button>
      </div>
    </div>
  `).join("");

  mount.querySelectorAll("[data-reply-btn]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const slug = btn.dataset.replyBtn;
      const input = mount.querySelector(`[data-reply-slug="${CSS.escape(slug)}"]`);
      const text = input.value.trim();
      if (!text) return;
      const post = allPosts.find(p => p.slug === slug);
      if (!post){ toast("Couldn't find that post", true); return; }
      btn.disabled = true;
      try{
        await addDoc(collection(db, "posts", post.id, "comments"), {
          name: "Vertex Theory",
          isAdmin: true,
          postSlug: slug,
          postTitle: post.title,
          text,
          createdAt: serverTimestamp()
        });
        input.value = "";
        toast("Reply posted");
        await loadMessages();
      }catch(e){
        console.error(e);
        toast("Couldn't post reply", true);
      }finally{
        btn.disabled = false;
      }
    });
  });
}
