// ============================================================
// VERTEX THEORY — Edge Middleware
// Facebook/X/WhatsApp crawlers do NOT execute JavaScript, so the
// client-rendered post.html (which fetches its content from
// Firestore after load) shows blank/placeholder previews when
// shared. This middleware intercepts requests to /post.html,
// fetches the matching post from Firestore's public REST API,
// and swaps the __OG_*__ placeholders in the HTML for real values
// before the response reaches the crawler (or the visitor).
//
// Runs on Vercel's Edge Runtime — no build step, no extra config
// beyond the FIRESTORE_PROJECT_ID environment variable below.
// ============================================================

export const config = {
  matcher: "/post.html",
};

// Set this in Vercel → Project → Settings → Environment Variables
// as FIRESTORE_PROJECT_ID (your Firebase project ID), OR just hard
// code it below — it is not a secret.
const FALLBACK_PROJECT_ID = "YOUR_PROJECT_ID";

export default async function middleware(request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("post");
  const response = await fetch(request);

  if (!slug) return response;

  const projectId =
    (typeof process !== "undefined" && process.env && process.env.FIRESTORE_PROJECT_ID) ||
    FALLBACK_PROJECT_ID;

  try {
    const post = await fetchPostBySlug(projectId, slug);
    if (!post) return response;

    let html = await response.text();
    const siteUrl = `${url.origin}/post.html?post=${encodeURIComponent(slug)}`;
    const title = escapeAttr(post.title || "Vertex Theory");
    const desc = escapeAttr(post.excerpt || "Read the full story on Vertex Theory.");
    const image = escapeAttr(post.image || "");

    html = html
      .replaceAll("__OG_TITLE__", title)
      .replaceAll("__OG_DESC__", desc)
      .replaceAll("__OG_IMAGE__", image)
      .replaceAll("__OG_URL__", siteUrl);

    return new Response(html, {
      status: response.status,
      headers: response.headers,
    });
  } catch (err) {
    // Any failure: fall back to the normal client-rendered page.
    return response;
  }
}

async function fetchPostBySlug(projectId, slug) {
  // Firestore REST "structured query" — works for public reads without
  // any credentials because our security rules allow public read on posts.
  const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: "posts" }],
      where: {
        compositeFilter: {
          op: "AND",
          filters: [
            { fieldFilter: { field: { fieldPath: "slug" }, op: "EQUAL", value: { stringValue: slug } } },
            { fieldFilter: { field: { fieldPath: "status" }, op: "EQUAL", value: { stringValue: "published" } } },
          ],
        },
      },
      limit: 1,
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return null;

  const rows = await res.json();
  const doc = rows.find((r) => r.document)?.document;
  if (!doc) return null;

  const f = doc.fields || {};
  return {
    title: f.title?.stringValue,
    excerpt: f.excerpt?.stringValue,
    image: f.image?.stringValue,
  };
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
