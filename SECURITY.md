# Security Policy

Lume-SSR turns JSX into HTML strings. For a library like this, **escaping is
the entire security model** — so the model is small, explicit, and
non-negotiable.

## The model

1. **Escape by default.** All string children and attribute values are
   HTML-escaped (`&`, `<`, `>`, `"`, `'`). Numbers and other primitives are
   stringified, then escaped.
2. **`SafeString` is the only trust marker.** Rendered output is wrapped in
   `SafeString` so composition doesn't double-escape. The only ways to mint a
   `SafeString` from raw text are `raw()` and
   `dangerouslySetInnerHTML={{ __html }}` — both explicit, local, and
   greppable in a codebase audit.
3. **Names are validated, not just values.** Attribute names that could
   terminate the attribute or tag (whitespace, quotes, `=`, `>`, `/`) are
   dropped; invalid tag names throw. This closes injection via spread props
   (`<div {...userData} />`).
4. **Plugins cannot bypass any of this.** Element plugins may replace tags,
   props, and children — the replacements go through the same validation and
   escaping as everything else.
5. **State serialization is breakout-safe.** `serializeState()` escapes `<`
   (and U+2028/U+2029) inside the JSON payload, so values containing
   `</script>` cannot escape the script tag.
6. **Zero runtime dependencies.** The supply-chain surface of `src/` is this
   repository, nothing else.
7. **No dynamic code.** No `eval`, no `new Function`, anywhere.

## Changes we will not accept

These are red lines for maintainers, contributors, and AI agents alike:

- Any global option, environment variable, plugin capability, or "fast mode"
  that **disables or weakens escaping or name validation** — even opt-in.
  Escape hatches must stay per-call-site (`raw()`), never ambient.
- Widening `VALID_ATTR_NAME` / `VALID_TAG_NAME` without demonstrating the
  added characters cannot break out of an attribute or tag context.
- Adding a runtime dependency to `src/`.
- Security-sensitive changes without a regression test reproducing the
  attack they prevent.
- Documentation or examples that pass user input to `raw()`,
  `dangerouslySetInnerHTML`, or unsanitized `<script>` interpolation. Docs
  must model the safe pattern (`serializeState`, escaping by default).
- `eval`/`new Function`, or fetching remote code at render time.

## Known limitations (honest list)

- `raw()` and `dangerouslySetInnerHTML` are trust declarations — Lume-SSR
  cannot protect you from HTML you explicitly mark as trusted. Sanitize
  untrusted HTML (e.g. rendered Markdown from users) with a dedicated
  sanitizer before wrapping it.
- String event-handler attributes (`onclick="..."`) are escaped against
  attribute breakout, but the *JavaScript inside them* is your
  responsibility. Never interpolate user input into them; prefer the
  data-attribute delegation pattern.
- Streamed Suspense content is inserted via `<template>` elements; content
  containing a literal `</template>` sequence inside raw (trusted) HTML could
  terminate the chunk early. Escaped content is unaffected.
- `head`/`body`/`scripts` passed to `renderDocument()` are trusted by
  contract (documented).

## Reporting a vulnerability

Please **do not open a public issue** for security reports. Email
**sathvikchinnu@gmail.com** with a proof of concept. You should receive a
response within 72 hours. Fixes ship with a regression test and a credit in
the release notes (unless you prefer anonymity).
