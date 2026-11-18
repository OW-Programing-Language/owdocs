/* Lightweight docs navigation: works without a build step or dependencies. */
(() => {
  const search = document.querySelector("#docs-search");
  const sections = Array.from(document.querySelectorAll("main section.section[id]"));
  const groups = Array.from(document.querySelectorAll(".nav-group"));
  const items = Array.from(document.querySelectorAll('.nav-group a[href^="#"]'));
  const empty = document.querySelector("#empty-results");
  const sidebar = document.querySelector(".sidebar");
  const toggle = document.querySelector("#mobile-toggle");

  function applySearch() {
    const query = (search?.value || "").toLocaleLowerCase().trim();
    let count = 0;
    for (const section of sections) {
      const show = !query || section.textContent.toLocaleLowerCase().includes(query);
      section.hidden = !show;
      section.style.display = show ? "" : "none";
      if (show) count++;
    }
    for (const item of items) {
      const section = document.getElementById(item.hash.slice(1));
      item.parentElement.hidden = !!section && section.hidden;
    }
    for (const group of groups) {
      group.hidden = Array.from(group.querySelectorAll("li")).every((li) => li.hidden);
    }
    if (empty) empty.style.display = count ? "none" : "block";
  }

  if (search) {
    search.addEventListener("input", applySearch);
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
        event.preventDefault(); search.focus();
      }
      if (event.key === "Escape" && document.activeElement === search) {
        search.value = ""; applySearch(); search.blur();
      }
    });
  }

  if (toggle && sidebar) {
    toggle.addEventListener("click", () => {
      const next = sidebar.getAttribute("data-open") !== "true";
      sidebar.setAttribute("data-open", String(next));
      toggle.setAttribute("aria-expanded", String(next));
    });
    for (const link of items) link.addEventListener("click", () => {
      sidebar.setAttribute("data-open", "false");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  for (const a of document.querySelectorAll("a[data-language-switch]")) {
    const to = a.getAttribute("href");
    a.addEventListener("click", () => {
      if (window.location.hash) a.href = to.split("#")[0] + window.location.hash;
    });
  }

  if (typeof IntersectionObserver !== "undefined") {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const id = visible[0].target.id;
      for (const link of items) {
        const current = link.getAttribute("href") === "#" + id;
        link.classList.toggle("active", current);
        if (current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      }
    }, { rootMargin: "-15% 0px -70% 0px" });
    for (const section of sections) observer.observe(section);
  }

  for (const pre of document.querySelectorAll("pre")) {
    const button = document.createElement("button");
    button.className = "copy-code";
    button.type = "button";
    const copyLabel = document.documentElement.lang === "fr" ? "Copier" : "Copy";
    const copiedLabel = document.documentElement.lang === "fr" ? "Copié" : "Copied";
    button.textContent = copyLabel;
    button.setAttribute("aria-label", copyLabel);
    button.addEventListener("click", async () => {
      const code = pre.querySelector("code")?.textContent ?? pre.textContent;
      try {
        await navigator.clipboard.writeText(code.trim());
        button.textContent = copiedLabel;
        window.setTimeout(() => button.textContent = copyLabel, 1600);
      } catch {
        button.textContent = copyLabel;
      }
    });
    pre.appendChild(button);
  }
})();