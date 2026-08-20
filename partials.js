// =============================================================================
// VERTEX THEORY — shared header + footer
// Injected client-side into #site-header / #site-footer placeholders so
// every page stays in sync without a templating build step.
// =============================================================================
import { initNavToggle, markActiveNav } from "./utils.js";

const YEAR = new Date().getFullYear();

const HEADER_HTML = `
  <div class="wrap site-header-inner">
    <a class="brand" href="/">
      <svg class="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 3 L29 27 H3 Z" stroke="#1F3FD6" stroke-width="2.2" stroke-linejoin="round" fill="none"/>
        <path d="M16 3 V27" stroke="#1F3FD6" stroke-width="2.2"/>
      </svg>
      <span class="brand-name">Vertex Theory</span>
    </a>
    <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="primary-nav" aria-label="Toggle menu">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </button>
    <nav class="site-nav" id="primary-nav" data-site-nav aria-label="Primary">
      <a href="/">Latest</a>
      <a href="/?category=money">Money</a>
      <a href="/?category=technology">Technology</a>
      <a href="/about.html">About</a>
    </nav>
  </div>
`;

const FOOTER_HTML = `
  <div class="wrap footer-grid">
    <div class="stack gap-3">
      <a class="brand" href="/" style="font-size:1.05rem;">
        <svg class="brand-mark" width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 3 L29 27 H3 Z" stroke="#1F3FD6" stroke-width="2.2" stroke-linejoin="round" fill="none"/>
          <path d="M16 3 V27" stroke="#1F3FD6" stroke-width="2.2"/>
        </svg>
        <span>Vertex Theory</span>
      </a>
      <p class="text-muted" style="max-width:38ch; font-size:0.9rem;">Essays on money, technology, and the decisions that quietly compound.</p>
    </div>
    <div class="footer-links">
      <a href="/">Latest</a>
      <a href="/?category=money">Money</a>
      <a href="/?category=technology">Technology</a>
      <a href="/about.html">About</a>
      <a href="/admin.html">Admin</a>
    </div>
  </div>
  <div class="wrap footer-copy">© ${YEAR} Vertex Theory. Written by one person, published on the internet.</div>
`;

export function mountLayout() {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (header) header.innerHTML = HEADER_HTML;
  if (footer) footer.innerHTML = FOOTER_HTML;
  initNavToggle();
  markActiveNav();
}
