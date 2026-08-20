// ============================================================
// VERTEX THEORY — homepage logic
// ============================================================
import { db } from "./firebase-config.js";
import {
  collection, getDocs, query, where, orderBy, limit
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import {
  renderHeader, renderFooter, wireNewsletterForms, getParam, formatDate,
  escapeHtml, vertexMarkSVG, animate, inView, stagger
} from "./app.js";

const PAGE_SIZE = 9;
let allPublished = [];
let visibleCount = PAGE_SIZE;
let activeCategory = getParam("category");

init();

async function init(){
  const settings = await renderHeader(activeCategory ? "category" : "home");
  wireNewsletterForms();

  try{
    const q = query(
      collection(db, "posts"),
      where("status", "==", "published"),
      orderBy("publishedAt", "desc"),
      limit(60)
    );
    const snap = await getDocs(q);
    allPublished = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }catch(e){
    console.error("Failed to load posts", e);
    allPublished = [];
  }

  renderCategoryRail();
  renderHero(settings);
  renderGrid();
  renderFooter(settings);
  wireLoadMore();
  runEntranceMotion();
}

function categoriesFrom(posts){
  const set = new Map();
  posts.forEach((p) => {
    if (!p.category) return;
    const key = p.category.toLowerCase();
    if (!set.has(key)) set.set(key, p.category);
  });
  return [...set.entries()]; // [ [slugKey, label], ... ]
}

function renderCategoryRail(){
  const mount = document.getElementById("category-rail");
  const cats = categoriesFrom(allPublished);
  if (!cats.length){ mount.style.display = "none"; return; }
  const chips = [`<button class="chip ${!activeCategory?'active':''}" data-cat="">All stories</button>`]
    .concat(cats.map(([key,label]) => `<button class="chip ${activeCategory===key?'active':''}" data-cat="${escapeHtml(key)}">${escapeHtml(label)}</button>`));
  mount.innerHTML = chips.join("");
  mount.querySelectorAll(".chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      const url = new URL(window.location.href);
      if (cat) url.searchParams.set("category", cat); else url.searchParams.delete("category");
      window.location.href = url.pathname + url.search;
    });
  });
}

function filteredPosts(){
  if (!activeCategory) return allPublished;
  return allPublished.filter((p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase());
}

function renderHero(settings){
  const grid = document.getElementById("hero-grid");
  if (activeCategory || !allPublished.length){
    // no hero on category-filtered views, or nothing published yet
    document.querySelector(".hero").style.display = allPublished.length ? "none" : "block";
    if (!allPublished.length){
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <div class="vx-mark">${vertexMarkSVG()}</div>
        <p>No stories published yet. Check back soon.</p>
      </div>`;
    }
    return;
  }

  const featured = allPublished.find((p) => p.slug === settings.featuredPostSlug) || allPublished[0];
  const rest = allPublished.filter((p) => p.id !== featured.id).slice(0, 3);

  grid.innerHTML = `
    <a href="/post.html?post=${encodeURIComponent(featured.slug)}" class="hero-feature" data-animate>
      ${featured.image ? `<img src="${escapeHtml(featured.image)}" alt="">` : ""}
      <div class="hero-feature-body">
        <span class="eyebrow">${escapeHtml(featured.category || "Featured")}</span>
        <h1>${escapeHtml(featured.title)}</h1>
        <div class="meta-row" style="color:rgba(237,239,234,.75)">
          <span>${formatDate(featured.publishedAt)}</span>
          <span class="meta-dot readtime">${featured.readTime || 4} min read</span>
        </div>
      </div>
    </a>
    <div class="hero-side">
      ${rest.map((p) => `
        <a href="/post.html?post=${encodeURIComponent(p.slug)}" class="hero-side-item" data-animate>
          <div class="hero-side-thumb">${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : ""}</div>
          <div class="hero-side-body">
            <span class="tag">${escapeHtml(p.category || "story")}</span>
            <h3>${escapeHtml(p.title)}</h3>
            <div class="meta-row"><span>${formatDate(p.publishedAt)}</span></div>
          </div>
        </a>
      `).join("")}
    </div>
  `;
}

function renderGrid(){
  const titleMount = document.getElementById("grid-title");
  const posts = filteredPosts();
  const label = activeCategory
    ? (categoriesFrom(allPublished).find(([k])=>k===activeCategory)?.[1] || activeCategory)
    : "Latest stories";
  titleMount.innerHTML = `<span class="vx-mark">${vertexMarkSVG()}</span> ${escapeHtml(label)}`;

  const mount = document.getElementById("post-grid");
  if (!posts.length){
    mount.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="vx-mark">${vertexMarkSVG()}</div>
      <p>Nothing here yet — try a different category.</p>
    </div>`;
    document.getElementById("load-more-wrap").style.display = "none";
    return;
  }

  const visible = posts.slice(0, visibleCount);
  mount.innerHTML = visible.map(postCard).join("");
  const wrap = document.getElementById("load-more-wrap");
  wrap.style.display = visibleCount < posts.length ? "block" : "none";
  runEntranceMotion();
}

function postCard(p){
  return `
    <a href="/post.html?post=${encodeURIComponent(p.slug)}" class="post-card" data-animate>
      <div class="post-card-thumb">${p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy">` : ""}</div>
      <div class="post-card-body">
        <span class="tag">${escapeHtml(p.category || "story")}</span>
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.excerpt || "")}</p>
        <div class="meta-row">
          <span>${formatDate(p.publishedAt)}</span>
          <span class="meta-dot readtime">${p.readTime || 4} min read</span>
        </div>
      </div>
    </a>
  `;
}

function wireLoadMore(){
  document.getElementById("load-more-btn").addEventListener("click", () => {
    visibleCount += PAGE_SIZE;
    renderGrid();
  });
}

function runEntranceMotion(){
  const els = document.querySelectorAll("[data-animate]:not([data-animated])");
  els.forEach((el, i) => {
    el.dataset.animated = "1";
    try{
      animate(el, { opacity: [0, 1], y: [14, 0] }, { duration: 0.5, delay: Math.min(i * 0.04, 0.3), easing: "ease-out" });
    }catch(e){}
  });
}
