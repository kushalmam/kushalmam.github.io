# Deployment headers

The audit of <https://kushalmam.github.io/> against [The Website Specification](https://specification.website/)
flagged three items that are **not fixable in this repository's build**:

| Item | Status | Why it fails here |
| --- | --- | --- |
| `x-content-type-options` | `required` | GitHub Pages offers no way to set response headers. |
| `frame-ancestors` | `required` | Same. It is only expressible as a CSP directive. |
| `cache-control` | `required` | Every response gets GitHub Pages' fixed `max-age=600`, including content-hashed assets that should be cached for a year. |

Everything else the audit raised is fixed in-repo. `public/_headers` contains the
correct headers, but **GitHub Pages silently ignores that file** — it is a
Cloudflare Pages / Netlify convention and nothing else reads it.

## What to do

Put a proxy that respects `_headers` in front of the custom domain:

1. Point `kushalmam.github.io`'s custom domain at Cloudflare.
2. Either deploy the same `dist/` to Cloudflare Pages (which reads `public/_headers`
   verbatim), or keep GitHub Pages as the origin and set the same headers as
   Cloudflare Transform Rules.
3. Verify with `curl -sI https://kushalmam.github.io/` that
   `x-content-type-options`, `content-security-policy`, `strict-transport-security`,
   `referrer-policy`, `permissions-policy`, and `link` are present, and that
   `/assets/*` returns `cache-control: public, max-age=31536000, immutable`.

## Two cautions

- **Content-Security-Policy.** Only `frame-ancestors`, `base-uri`, and `object-src`
  are enabled, because they cannot break anything. The full policy is commented out
  in `public/_headers`. `index.html` carries an inline `<style>` block and an inline
  JSON-LD data block, so before enabling `script-src 'self'`, confirm structured data
  still parses (Rich Results Test). If a browser does block the data block, add its
  `sha256-` hash to `script-src` rather than falling back to `'unsafe-inline'`.
- **HSTS.** `includeSubDomains` is added; the preload list is deliberately not.
  The spec's own [`hsts` page](https://specification.website/spec/security/hsts/)
  argues against preloading.

## Still not satisfiable anywhere

`compression` is `required` and asks for brotli with gzip as the fallback. GitHub
Pages serves gzip only. Cloudflare negotiates brotli automatically, so proxying the
domain fixes this one too.
