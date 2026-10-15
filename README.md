# owdocs

Documentation site for the [Ow programming language](https://github.com/OW-Programing-Language/ow-lang),
plus a tiny zero-dependency Node.js server to host it.

## Contents

- `index.html`, `fr.html` — documentation pages (English / French)
- `style.css` — styles
- `server.js` — static file server for the docs

## Running locally

Requires Node.js.

```sh
node server.js
```

Then open http://localhost:3000/owdocs/ . The port can be overridden with the
`PORT` (or `SERVER_PORT`) environment variable.

## Downloads

The `downloads/` directory is where OwIDE jars/installers are served from at
runtime. Those binaries are published via
[Releases](https://github.com/OW-Programing-Language/ow-lang/releases) and are
not committed here.
