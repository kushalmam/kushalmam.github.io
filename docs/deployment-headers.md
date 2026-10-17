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

## Two ways to make it live, and only one reads `_headers`

`_headers` is parsed by the *hosting* product, not by a proxy. So the choice of
setup matters:

| Setup | Is `public/_headers` read? | What to do instead |
| --- | --- | --- |
| Deploy `dist/` to **Cloudflare Pages** (or Netlify) and point the domain there | Yes — verbatim | Nothing. Push, then verify. |
| Keep **GitHub Pages** as the origin, put **Cloudflare** in front as a proxy | No | Replicate the same values as a Cloudflare **Transform Rule**, or in a **Worker** that adds the headers to the response. |

The first option is less work and is the one the file is written for. The second
keeps the current deploys exactly as they are and moves the headers to the edge.

Either way, verify with:

```sh
curl -sI https://kushalmam.github.io/ | grep -iE 'x-content-type|content-security|strict-transport|referrer-policy|permissions-policy|^link'
curl -sI https://kushalmam.github.io/assets/index-*.js | grep -i cache-control
```

Expect `cache-control: public, max-age=31536000, immutable` on the hashed asset
(not Pages' fixed `max-age=600`), and the six headers above on the document.

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
