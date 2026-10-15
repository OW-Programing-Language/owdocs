const fs = require("fs");
const path = require("path");
const http = require("http");

const host = "0.0.0.0";
const port = Number(process.env.PORT || process.env.SERVER_PORT || 3000);
const docsRoot = path.join(__dirname, "owdocs");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jar": "application/java-archive",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  res.end(body);
}

function redirect(res, location) {
  send(res, 302, { Location: location }, "");
}

function notFound(res) {
  send(res, 404, { "Content-Type": "text/plain; charset=utf-8" }, "Not found");
}

function internalError(res) {
  send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Internal server error");
}

function getFilePath(urlPath) {
  let relativePath = urlPath.replace(/^\/owdocs\/?/, "");
  if (relativePath === "") {
    relativePath = "index.html";
  }

  const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const absolutePath = path.join(docsRoot, safePath);

  if (!absolutePath.startsWith(docsRoot)) {
    return null;
  }

  return absolutePath;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method !== "GET" && req.method !== "HEAD") {
    send(res, 405, { "Content-Type": "text/plain; charset=utf-8" }, "Method not allowed");
    return;
  }

  if (url.pathname === "/") {
    redirect(res, "/owdocs/");
    return;
  }

  if (url.pathname === "/health") {
    send(res, 200, { "Content-Type": "application/json; charset=utf-8" }, JSON.stringify({ ok: true }));
    return;
  }

  if (!url.pathname.startsWith("/owdocs")) {
    notFound(res);
    return;
  }

  const filePath = getFilePath(url.pathname);
  if (!filePath) {
    notFound(res);
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr) {
      if (statErr.code === "ENOENT") {
        notFound(res);
        return;
      }
      internalError(res);
      return;
    }

    const resolvedPath = stats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const extension = path.extname(resolvedPath).toLowerCase();
    const contentType = contentTypes[extension] || "application/octet-stream";

    fs.readFile(resolvedPath, (readErr, data) => {
      if (readErr) {
        if (readErr.code === "ENOENT") {
          notFound(res);
          return;
        }
        internalError(res);
        return;
      }

      send(
        res,
        200,
        {
          "Cache-Control": "public, max-age=300",
          "Content-Length": data.length,
          "Content-Type": contentType
        },
        req.method === "HEAD" ? "" : data
      );
    });
  });
});

server.listen(port, host, () => {
  console.log(`Ow docs server listening on ${host}:${port}`);
});
