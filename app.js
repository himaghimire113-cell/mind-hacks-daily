// ============================================================
// VERTEX THEORY — shared front-end utilities
// Used by index.html, post.html and about.html
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, doc, getDoc, getDocs, query, where, orderBy,
  addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { animate, inView, stagger } from "https://cdn.jsdelivr.net/npm/motion@11.11.13/+esm";

export { animate, inView, stagger };

/* ---------------- Vertex mark (inline SVG, reused everywhere) --------------- */
export function vertexMarkSVG(){
  return `<svg viewBox="0 0 30 22" aria-hidden="true">
    <path class="curve" d="M2 20 C 9 20, 11 3, 15 3 S 21 20, 28 20" />
    <circle class="dot" cx="15" cy="3" r="2.6" />
  </svg>`;
}

export function vertexDividerSVG(){
  return `<svg class="vx-divider" viewBox="0 0 400 34" preserveAspectRatio="none" aria-hidden="true">
    <path fill="none" stroke="currentColor" stroke-width="1.4" d="M0 30 C 90 30, 130 4, 200 4 S 310 30, 400 30" />
    <circle cx="200" cy="4" r="3" fill="currentColor"/>
  </svg>`;
}

/* ---------------- Settings (site branding) — cached in sessionStorage ------- */
const DEFAULT_SETTINGS = {
  siteTitle: "Vertex",
  siteTitleAccent: "Theory",
  tagline: "Every story has a turning point.",
  colorGold: "#D4A537",
  colorBlue: "#2F5D8A",
  colorCoral: "#C6402F",
  featuredPostSlug: "",
  adSponsorName: "Advertise here",
  adSponsorText: "Reach readers who read to the end. Get in touch to sponsor this space.",
  adSponsorLink: "#",
  footerNote: "Independent stories, told straight."
};

export async function getSettings(){
  try{
    const cached = sessionStorage.getItem("vx_settings");
    if (cached) return { ...DEFAULT_SETTINGS, ...JSON.parse(cached) };
  }catch(e){}
  try{
    const snap = await getDoc(doc(db, "settings", "site"));
    const data = snap.exists() ? snap.data() : {};
    const merged = { ...DEFAULT_SETTINGS, ...data };
    try{ sessionStorage.setItem("vx_settings", JSON.stringify(merged)); }catch(e){}
    applyThemeColors(merged);
    return merged;
  }catch(e){
    console.warn("Settings fetch failed, using defaults", e);
    return DEFAULT_SETTINGS;
  }
}

export function applyThemeColors(settings){
  const root = document.documentElement.style;
  if (settings.colorGold) root.setProperty("--gold-bright", settings.colorGold);
  if (settings.colorBlue) root.setProperty("--blue", settings.colorBlue);
  if (settings.colorCoral) root.setProperty("--coral", settings.colorCoral);
}

/* ---------------- Imgur helper ---------------- */
// Converts an Imgur *page* URL (imgur.com/abc123) or gallery URL into a
// direct image URL (i.imgur.com/abc123.jpg). Leaves already-direct URLs,
// and non-imgur URLs, untouched.
export function resolveImageUrl(url){
  if (!url) return "";
  url = url.trim();
  try{
    const u = new URL(url);
    if (!/(^|\.)imgur\.com$/.test(u.hostname)) return url;
    if (u.hostname === "i.imgur.com") return url; // already direct
    // /gallery/abc123 or /a/abc123 or /abc123 or /t/tag/abc123
    const parts = u.pathname.split("/").filter(Boolean);
    let id = parts[parts.length - 1];
    id = id.replace(/\.(jpg|jpeg|png|gif|webp)$/i, "");
    if (!id || id === "gallery" || id === "a") return url;
    return `https://i.imgur.com/${id}.jpg`;
  }catch(e){
    return url;
  }
}

/* ---------------- Read time ---------------- */
export function computeReadTime(html){
  const text = String(html || "").replace(/<[^>]*>/g, " ");
  const words = (text.match(/\S+/g) || []).length;
  return Math.max(1, Math.round(words / 200));
}

/* ---------------- Formatting ---------------- */
export function formatDate(ts){
  let d;
  if (!ts) return "";
  if (ts.toDate) d = ts.toDate();
  else d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { day:"2-digit", month:"short", year:"numeric" });
}

export function escapeHtml(str){
  return String(str || "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}

export function slugify(str){
  return String(str || "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/* ---------------- Query params (defensive — ignores fbclid etc.) ---------------- */
export function getParam(name){
  try{
    return new URLSearchParams(window.location.search).get(name);
  }catch(e){ return null; }
}

/* ---------------- Toast ---------------- */
let toastEl, toastTimer;
export function toast(msg, isErr){
  if (!toastEl){
    toastEl = document.createElement("div");
    toastEl.className = "toast";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.classList.toggle("err", !!isErr);
  requestAnimationFrame(() => toastEl.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
}

/* ---------------- Newsletter signup (shared across pages) ---------------- */
export function wireNewsletterForms(){
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type=email]");
      const btn = form.querySelector("button");
      const email = (input.value || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        toast("Enter a valid email address", true);
        return;
      }
      // honeypot — silently "succeed" for bots without writing
      const honeypot = form.querySelector("input[name=website]");
      if (honeypot && honeypot.value){ input.value = ""; toast("Subscribed"); return; }

      btn.disabled = true;
      const original = btn.textContent;
      btn.innerHTML = '<span class="spin"></span>';
      try{
        const existing = await getDocs(query(collection(db, "subscribers"), where("email", "==", email)));
        if (existing.empty){
          await addDoc(collection(db, "subscribers"), {
            email,
            source: location.pathname,
            createdAt: serverTimestamp()
          });
        }
        toast("You're subscribed — welcome aboard.");
        input.value = "";
      }catch(err){
        console.error(err);
        toast("Couldn't subscribe right now. Try again shortly.", true);
      }finally{
        btn.disabled = false;
        btn.textContent = original;
      }
    });
  });
}

/* ---------------- Header / nav (shared shell) ---------------- */
export async function renderHeader(activePage){
  const mount = document.getElementById("site-header");
  if (!mount) return;
  const settings = await getSettings();
  document.title = document.title || settings.siteTitle;

  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  mount.innerHTML = `
    <div class="header-row">
      <div class="header-date">${today}</div>
      <a href="/" class="vx-mark">
        ${vertexMarkSVG()}
        <span class="vx-wordmark">${escapeHtml(settings.siteTitle)} <em>${escapeHtml(settings.siteTitleAccent)}</em></span>
      </a>
      <nav class="main-nav nav-desktop">
        <a href="/" class="${activePage==='home'?'active':''}">Home</a>
        <a href="/?category=life-story" class="${activePage==='category'?'active':''}">Stories</a>
        <a href="/about.html" class="${activePage==='about'?'active':''}">About</a>
      </nav>
      <div class="header-actions">
        <button class="menu-btn" id="menu-toggle" aria-label="Open menu" aria-expanded="false">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
    <nav class="mobile-nav" id="mobile-nav">
      <a href="/">Home</a>
      <a href="/?category=life-story">Stories</a>
      <a href="/about.html">About</a>
    </nav>
  `;

  const toggle = document.getElementById("menu-toggle");
  const navEl = document.getElementById("mobile-nav");
  toggle.addEventListener("click", () => {
    const open = navEl.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  return settings;
}

export function renderFooter(settings){
  const mount = document.getElementById("site-footer");
  if (!mount) return;
  const s = settings || DEFAULT_SETTINGS;
  mount.innerHTML = `
    <div class="wrap">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="vx-mark" style="color:#fff">
            ${vertexMarkSVG()}
            <span class="vx-wordmark" style="color:#fff">${escapeHtml(s.siteTitle)} <em>${escapeHtml(s.siteTitleAccent)}</em></span>
          </a>
          <p>${escapeHtml(s.footerNote)}</p>
        </div>
        <div class="footer-col">
          <h5>Explore</h5>
          <a href="/">Home</a>
          <a href="/?category=life-story">Life story</a>
          <a href="/?category=moral">Moral</a>
          <a href="/about.html">About</a>
        </div>
        <div class="footer-col">
          <h5>Stay in touch</h5>
          <a href="/about.html">Contact / About</a>
          <a href="/admin.html">Admin</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} ${escapeHtml(s.siteTitle)} ${escapeHtml(s.siteTitleAccent)}. All rights reserved.</span>
        <span>built on a vertex</span>
      </div>
    </div>
  `;
}

/* ---------------- Ad slot renderer ---------------- */
export function adSlotHTML(s){
  return `
    <div class="ad-slot">
      <span class="ad-slot-label">Presented by</span>
      <div class="ad-slot-body">
        <div class="sponsor-name">${escapeHtml(s.adSponsorName)}</div>
        <p>${escapeHtml(s.adSponsorText)}</p>
      </div>
      <a href="${escapeHtml(s.adSponsorLink)}" class="btn btn-outline btn-sm" target="_blank" rel="noopener sponsored">Learn more</a>
    </div>
  `;
}

export { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, serverTimestamp };
