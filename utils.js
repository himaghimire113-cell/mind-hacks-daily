// =============================================================================
// VERTEX THEORY — shared utilities
// =============================================================================

/**
 * Get a URL query param defensively using URLSearchParams.
 * Ignores fbclid and other tracking params automatically since we only
 * read the specific key we ask for.
 */
export function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Build a query-param URL for internal navigation, e.g. buildUrl("post", "money-milestones")
 * -> "/?post=money-milestones"
 */
export function buildUrl(param, value) {
  const url = new URL(window.location.origin + "/");
  if (param && value) url.searchParams.set(param, value);
  return url.pathname + url.search;
}

/**
 * Converts common Imgur share-page / gallery links into a direct image URL
 * so they render as <img src="..."> instead of a blank broken image.
 *   https://imgur.com/a/abc123        -> https://i.imgur.com/abc123.jpg (best effort, gallery pages need the id)
 *   https://imgur.com/abc123          -> https://i.imgur.com/abc123.jpg
 *   https://imgur.com/gallery/abc123  -> https://i.imgur.com/abc123.jpg
 *   https://i.imgur.com/abc123.png    -> unchanged (already direct)
 * Any URL that already points at i.imgur.com or another host is returned unchanged.
 */
export function toDirectImageUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  const url = rawUrl.trim();

  try {
    const parsed = new URL(url);

    // Already a direct Imgur asset — leave it alone.
    if (parsed.hostname === "i.imgur.com") return url;

    if (parsed.hostname === "imgur.com" || parsed.hostname === "www.imgur.com") {
      // Strip leading slash, then take the last path segment as the image id.
      const segments = parsed.pathname.split("/").filter(Boolean);
      const id = segments[segments.length - 1];
      if (id) {
        // No extension on Imgur share links — default to .jpg, which Imgur's
        // CDN will happily serve regardless of the source format.
        const hasExt = /\.(jpg|jpeg|png|gif|webp)$/i.test(id);
        return `https://i.imgur.com/${hasExt ? id : id + ".jpg"}`;
      }
    }
  } catch (e) {
    // Not a valid URL — fall through and return as-is.
  }

  return url;
}

/** Basic HTML-escaping for values inserted via textContent-unsafe paths. */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Turns a title into a URL-safe slug. */
export function slugify(title) {
  return String(title)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Formats a Firestore Timestamp or Date into "Aug 20, 2026". */
export function formatDate(value) {
  if (!value) return "";
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/** Rough reading-time estimate from plain text/HTML body. */
export function readingTime(html) {
  const text = String(html || "").replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}

/**
 * Wires up the mobile nav toggle. Call once per page after the header
 * markup is in the DOM.
 */
export function initNavToggle() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/** Marks the current page's nav link with aria-current="page". */
export function markActiveNav() {
  const path = window.location.pathname.replace(/\/index\.html$/, "/");
  const isPost = new URLSearchParams(window.location.search).has("post");
  document.querySelectorAll("[data-site-nav] a").forEach((link) => {
    const href = link.getAttribute("href");
    const isHome = (href === "/" || href === "/index.html") && (path === "/" || path === "") && !isPost;
    const matchesPath = href && path.endsWith(href) && href !== "/";
    if (isHome || matchesPath) link.setAttribute("aria-current", "page");
  });
}
