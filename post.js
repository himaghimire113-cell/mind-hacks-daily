// ============================================================
// VERTEX THEORY — post page logic
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, increment,
  query, where, orderBy, limit, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
  renderHeader, renderFooter, getParam, formatDate, escapeHtml, resolveImageUrl,
  vertexMarkSVG, toast, adSlotHTML, getSettings, animate
} from "./app.js";

const slug = getParam("post");
let currentPost = null;
let currentPostRef = null;

init();

async function init(){
  const settings = await renderHeader();

  if (!slug){
    document.getElementById("post-hero").innerHTML = `<div class="empty-state"><p>No story specified.</p><a href="/" class="btn btn-outline" style="margin-top:12px">Back to homepage</a></div>`;
    renderFooter(settings);
    return;
  }

  try{
    const q = query(collection(db, "posts"), where("slug", "==", slug), limit(1));
    const snap = await getDocs(q);
    if (snap.empty || snap.docs[0].data().status !== "published"){
      showNotFound(settings);
      return;
    }
    currentPostRef = snap.docs[0].ref;
    currentPost = { id: snap.docs[0].id, ...snap.docs[0].data() };
  }catch(e){
    console.error(e);
    showNotFound(settings);
    return;
  }

  renderPost(settings);
  wireLikes();
  wireShare();
  wireCommentForm();
  loadComments();
  loadSidebar(settings);
  renderFooter(settings);
}

function showNotFound(settings){
  document.getElementById("post-hero").innerHTML = `<div class="empty-state">
    <div class="vx-mark">${vertexMarkSVG()}</div>
    <p>This story couldn't be found — it may have been unpublished.</p>
    <a href="/" class="btn btn-outline" style="margin-top:12px">Back to homepage</a>
  </div>`;
  document.querySelector(".post-layout").style.display = "none";
  renderFooter(settings);
}

function renderPost(settings){
  const p = currentPost;
  document.title = `${p.title} · ${settings.siteTitle} ${settings.siteTitleAccent}`;

  document.getElementById("post-hero").innerHTML = `
    <span class="eyebrow">${escapeHtml(p.category || "Story")}</span>
    <h1 class="post-title">${escapeHtml(p.title)}</h1>
    ${p.excerpt ? `<p class="post-lede">${escapeHtml(p.excerpt)}</p>` : ""}
    <div class="meta-row">
      <span>${formatDate(p.publishedAt)}</span>
      <span class="meta-dot readtime">${p.readTime || 4} min read</span>
      ${(p.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join("")}
    </div>
  `;

  const cover = document.getElementById("post-cover");
  if (p.image){
    cover.style.display = "block";
    cover.classList.remove("skel");
    cover.innerHTML = `<img src="${escapeHtml(resolveImageUrl(p.image))}" alt="${escapeHtml(p.title)}">`;
  }

  document.getElementById("post-body").innerHTML = linkifyAffiliates(p.body || "");
  document.getElementById("post-actions").style.display = "flex";
  document.getElementById("like-count").textContent = p.likes || 0;

  document.getElementById("author-box").style.display = "flex";
  const authorName = p.author || "Vertex Theory";
  document.getElementById("author-name").textContent = authorName;
  document.getElementById("author-avatar").textContent = authorName.charAt(0).toUpperCase();

  document.getElementById("comments-mark").innerHTML = vertexMarkSVG();

  document.getElementById("ad-slot-mount").innerHTML = adSlotHTML(settings);

  try{ animate("#post-hero, .post-cover, .post-body", { opacity:[0,1], y:[10,0] }, { duration:.5, easing:"ease-out" }); }catch(e){}
}

// Renders stored HTML/markdown-ish body. Plain paragraphs are wrapped;
// existing <a> tags (affiliate links, etc.) are preserved and get
// rel=nofollow sponsored for outbound safety.
function linkifyAffiliates(body){
  let html = body;
  if (!/<p|<div|<h[1-6]/i.test(html)){
    html = html.split(/\n{2,}/).map(p => `<p>${escapeHtml(p).replace(/\n/g,"<br>")}</p>`).join("");
  }
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  tmp.querySelectorAll("a[href]").forEach((a) => {
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "nofollow sponsored noopener");
  });
  tmp.querySelectorAll("img[src]").forEach((img) => {
    img.setAttribute("src", resolveImageUrl(img.getAttribute("src")));
    img.setAttribute("loading", "lazy");
  });
  return tmp.innerHTML;
}

/* ---------------- Likes ---------------- */
function wireLikes(){
  const btn = document.getElementById("like-btn");
  const key = `vx_liked_${slug}`;
  if (localStorage.getItem(key)) btn.classList.add("liked");

  btn.addEventListener("click", async () => {
    const liked = btn.classList.contains("liked");
    const delta = liked ? -1 : 1;
    btn.classList.toggle("liked");
    document.getElementById("like-count").textContent = (parseInt(document.getElementById("like-count").textContent,10) || 0) + delta;
    try{
      await updateDoc(currentPostRef, { likes: increment(delta) });
      if (liked) localStorage.removeItem(key); else localStorage.setItem(key, "1");
    }catch(e){
      console.error(e);
      btn.classList.toggle("liked");
      document.getElementById("like-count").textContent = (parseInt(document.getElementById("like-count").textContent,10) || 0) - delta;
      toast("Couldn't save your like right now", true);
    }
  });
}

/* ---------------- Share ---------------- */
function wireShare(){
  const url = window.location.href.split("?")[0] + "?post=" + encodeURIComponent(slug);
  document.querySelectorAll("[data-share]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const type = btn.dataset.share;
      if (type === "copy"){
        try{
          await navigator.clipboard.writeText(url);
          toast("Link copied");
        }catch(e){ toast("Couldn't copy link", true); }
        return;
      }
      const text = encodeURIComponent(currentPost.title);
      const enc = encodeURIComponent(url);
      const map = {
        whatsapp: `https://wa.me/?text=${text}%20${enc}`,
        x: `https://twitter.com/intent/tweet?text=${text}&url=${enc}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${enc}`
      };
      if (map[type]) window.open(map[type], "_blank", "noopener,width=600,height=500");
    });
  });

  if (navigator.share){
    const group = document.querySelector(".share-group");
    const nativeBtn = document.createElement("button");
    nativeBtn.className = "share-btn";
    nativeBtn.setAttribute("aria-label", "Share");
    nativeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5 15.4 6.5M8.6 13.5l6.8 4"/></svg>`;
    nativeBtn.addEventListener("click", () => {
      navigator.share({ title: currentPost.title, url }).catch(() => {});
    });
    group.prepend(nativeBtn);
  }
}

/* ---------------- Comments (also serves as reader → admin messages) ---------------- */
function commentsCol(){
  return collection(db, "posts", currentPost.id, "comments");
}

async function loadComments(){
  const mount = document.getElementById("comment-list");
  try{
    const q = query(commentsCol(), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    if (snap.empty){
      mount.innerHTML = `<div class="comment-empty">No comments yet — be the first to share your thoughts.</div>`;
      return;
    }
    mount.innerHTML = snap.docs.map((d) => commentHTML(d.data())).join("");
  }catch(e){
    console.error(e);
    mount.innerHTML = `<div class="comment-empty">Couldn't load comments right now.</div>`;
  }
}

function commentHTML(c){
  return `
    <div class="comment ${c.isAdmin ? "is-admin" : ""}">
      <div class="comment-head">
        <span class="comment-name">${escapeHtml(c.name || "Reader")}</span>
        ${c.isAdmin ? `<span class="comment-badge">Vertex Theory</span>` : ""}
        <span class="comment-date">${formatDate(c.createdAt)}</span>
      </div>
      <p class="comment-text">${escapeHtml(c.text)}</p>
    </div>
  `;
}

function wireCommentForm(){
  const form = document.getElementById("comment-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const honeypot = document.getElementById("c-honeypot");
    if (honeypot.value){ form.reset(); toast("Comment posted"); return; }

    const name = document.getElementById("c-name").value.trim();
    const email = document.getElementById("c-email").value.trim();
    const text = document.getElementById("c-text").value.trim();
    if (!name || !email || !text) return;

    const btn = document.getElementById("comment-submit");
    btn.disabled = true;
    const original = btn.textContent;
    btn.innerHTML = `<span class="spin"></span>`;

    try{
      await addDoc(commentsCol(), {
        name, email, text,
        isAdmin: false,
        postSlug: slug,
        postTitle: currentPost.title,
        read: false,
        createdAt: serverTimestamp()
      });
      form.reset();
      toast("Comment posted — thank you.");
      loadComments();
    }catch(err){
      console.error(err);
      toast("Couldn't post your comment. Try again.", true);
    }finally{
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

/* ---------------- Sidebar widgets ---------------- */
async function loadSidebar(settings){
  const aside = document.getElementById("sidebar");
  let mostViewed = [];
  try{
    const q = query(collection(db, "posts"), where("status", "==", "published"), orderBy("likes", "desc"), limit(4));
    const snap = await getDocs(q);
    mostViewed = snap.docs.map(d => d.data()).filter(p => p.slug !== slug);
  }catch(e){ console.warn(e); }

  aside.innerHTML = `
    <div class="widget">
      <h4 class="widget-title">Most liked</h4>
      <div class="widget-list">
        ${mostViewed.length ? mostViewed.slice(0,4).map((p,i) => `
          <a class="widget-item" href="/post.html?post=${encodeURIComponent(p.slug)}">
            <span class="num">${String(i+1).padStart(2,"0")}</span>
            <h4>${escapeHtml(p.title)}</h4>
          </a>
        `).join("") : `<p style="font-size:.85rem;color:var(--ink-faint)">Nothing else to show yet.</p>`}
      </div>
    </div>
    <div class="widget">
      <h4 class="widget-title">Newsletter</h4>
      <p style="font-size:.86rem;color:var(--ink-soft);margin:0 0 12px">Get the next story before anyone else.</p>
      <form data-newsletter-form>
        <input type="text" name="website" autocomplete="off" tabindex="-1" style="position:absolute;left:-9999px" aria-hidden="true">
        <div class="field"><input type="email" required placeholder="you@email.com"></div>
        <button type="submit" class="btn btn-primary btn-block">Subscribe</button>
      </form>
    </div>
  `;
  const { wireNewsletterForms } = await import("./app.js");
  wireNewsletterForms();
}
