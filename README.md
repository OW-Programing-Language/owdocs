# OW Language Documentation

Official documentation site for the [OW programming language](https://github.com/OW-Programing-Language/ow-lang).

The site has a searchable, mobile-friendly, **static English/French reference**.
It covers current features from `ow-lang/main`: typed YAML syntax, OOP,
collections, imports, modules and functors, source dependencies, OWUnit and
exceptions, file/model storage, HTTP/desktop interfaces, packaging and the
experimental LLVM native backend.

## Site structure

| File | Purpose |
|---|---|
| `index.html` | English guide (33 sections) |
| `fr.html` | French guide (the same 33 sections and anchor IDs) |
| `style.css` | Responsive layout and code formatting |
| `docs.js` | Search, mobile navigation and copy-to-clipboard buttons |
| `server.js` | Dependency-free Node.js static host, serving `/owdocs/` |
| `scripts/validate-docs.js` | EN/FR parity, anchors and local links |
| `scripts/server.test.js` | HTTP smoke/security checks |
| `.github/workflows/docs.yml` | CI for docs and server tests |

## Run locally

Requires Node.js 20+ (no `npm install` needed).

```sh
node server.js
```

Open <http://localhost:3000/owdocs/> (French:
<http://localhost:3000/owdocs/fr.html>). Override the port with `PORT` or
`SERVER_PORT`. `GET /health` returns a JSON health check.

## Validate changes

```sh
node scripts/validate-docs.js
node --test scripts/server.test.js
```

Both pages must have matching section IDs and navigation targets. Never claim
interpreter-only features work in native LLVM: describe the compiled subset
and link the relevant guide in `ow-lang/docs/`.

## Content maintenance

- Use the current [ow-lang source](https://github.com/OW-Programing-Language/ow-lang)
  and executable examples as the primary source of truth. Some older feature
  documents may have stale limitation statements; prefer newer implementation
  notes, working examples and CI when they disagree.
- Edit both `index.html` and `fr.html` together. Preserve matching anchor IDs
  so language switching keeps the selected topic.
- Prefer canonical GitHub Releases links for binaries. The `downloads/`
  directory is only an optional runtime artifact folder; release binaries are
  not committed to `owdocs`.
- Run the validation scripts before opening a PR. CI checks all pull requests.

## Licensing

The OW language source is licensed under the
[MIT license](https://github.com/OW-Programing-Language/ow-lang/blob/main/LICENSE).
