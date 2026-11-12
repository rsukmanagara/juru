// Juru server — Cloudflare Worker
//
// Keeps your AI API keys secret on the server so every device only needs a short PIN.
// The app sends requests here with the header "x-juru-pin"; this worker checks the PIN,
// adds the real API key, forwards the request to the AI provider, and streams the answer back.
//
// Set these in Cloudflare (Worker → Settings → Variables and Secrets):
//   JURU_PIN          (Secret, required)  the PIN you type in the app; use 6+ characters
//   GEMINI_API_KEY    (Secret, optional)  Google AI Studio key
//   OPENAI_API_KEY    (Secret, optional)  OpenAI key
//   ANTHROPIC_API_KEY (Secret, optional)  Anthropic key
//   ALLOWED_ORIGIN    (Text, recommended) e.g. https://rsukmanagara.github.io
//                                         (comma-separated for several; empty = allow any site)

const PROVIDERS = {
  gemini: {
    base: "https://generativelanguage.googleapis.com",
    secret: "GEMINI_API_KEY",
    paths: [/^\/v1beta\/models$/, /^\/v1beta\/models\/[A-Za-z0-9._-]+:(streamGenerateContent|generateContent)$/],
    auth: (key) => ({ "x-goog-api-key": key }),
  },
  openai: {
    base: "https://api.openai.com",
    secret: "OPENAI_API_KEY",
    paths: [/^\/v1\/chat\/completions$/, /^\/v1\/models$/],
    auth: (key) => ({ Authorization: "Bearer " + key }),
  },
  anthropic: {
    base: "https://api.anthropic.com",
    secret: "ANTHROPIC_API_KEY",
    paths: [/^\/v1\/messages$/, /^\/v1\/models$/],
    auth: (key) => ({ "x-api-key": key, "anthropic-version": "2023-06-01" }),
  },
};

function allowedOrigins(env) {
  return String(env.ALLOWED_ORIGIN || "").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, x-juru-pin, anthropic-version",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(body, status, cors) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...cors },
  });
}

// Compares two strings without leaking how many characters matched.
async function sameSecret(a, b) {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(String(a))),
    crypto.subtle.digest("SHA-256", enc.encode(String(b))),
  ]);
  const u = new Uint8Array(x), v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    const allowed = allowedOrigins(env);
    if (origin && allowed.length && !allowed.includes(origin)) {
      return json({ error: { message: "Situs ini tidak diizinkan memakai server Juru." } }, 403, {});
    }
    const cors = corsHeaders(origin && (allowed.length ? origin : "*"));

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

    if (!env.JURU_PIN) return json({ error: { message: "JURU_PIN belum diatur di server." } }, 500, cors);
    const pin = request.headers.get("x-juru-pin") || "";
    if (!pin || !(await sameSecret(pin, env.JURU_PIN))) {
      await new Promise((r) => setTimeout(r, 800)); // slows down guessing
      return json({ error: { message: "PIN salah." } }, 401, cors);
    }

    if (url.pathname === "/ping") {
      const providers = {};
      for (const [id, p] of Object.entries(PROVIDERS)) providers[id] = !!env[p.secret];
      return json({ ok: true, providers }, 200, cors);
    }

    const m = url.pathname.match(/^\/(gemini|openai|anthropic)(\/.*)$/);
    if (!m) return json({ error: { message: "Alamat tidak dikenal." } }, 404, cors);
    const P = PROVIDERS[m[1]], path = m[2];
    const key = env[P.secret];
    if (!key) return json({ error: { message: "API key " + m[1] + " belum diatur di server." } }, 404, cors);
    if (!P.paths.some((re) => re.test(path))) return json({ error: { message: "Alamat tidak diizinkan." } }, 404, cors);
    if (request.method !== "GET" && request.method !== "POST") return json({ error: { message: "Metode tidak diizinkan." } }, 405, cors);

    const query = new URLSearchParams(url.search);
    query.delete("key");
    const target = P.base + path + (query.toString() ? "?" + query.toString() : "");
    const headers = { ...P.auth(key) };
    const ct = request.headers.get("content-type");
    if (ct) headers["content-type"] = ct;

    let upstream;
    try {
      upstream = await fetch(target, {
        method: request.method,
        headers,
        body: request.method === "POST" ? request.body : undefined,
      });
    } catch (e) {
      return json({ error: { message: "Server tidak bisa menghubungi " + m[1] + "." } }, 502, cors);
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") || "application/json",
        "cache-control": "no-store",
        ...cors,
      },
    });
  },
};
