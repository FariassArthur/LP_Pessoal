/* =========================================================
   Arthur Farias — portfólio
   - tema claro / escuro persistente
   - menu mobile acessível
   - link ativo na navegação
   - parallax do monograma
   - revelação das figuras por scroll
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const nav = document.getElementById("primary-nav");
  const menuBtn = document.getElementById("menu-toggle");

  /* ---------------- tema ---------------- */
  const root = document.documentElement;
  const themeToggle = document.getElementById("theme-toggle");
  const themeLabel = document.getElementById("theme-toggle-label");
  const themeMeta = document.getElementById("theme-color");
  const darkMedia = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme, persist) {
    root.setAttribute("data-theme", theme);

    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* ignora */ }
    }

    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark" ? "Tema escuro. Mudar para tema claro." : "Tema claro. Mudar para tema escuro."
      );
    }

    if (themeLabel) themeLabel.textContent = theme === "dark" ? "escuro" : "claro";
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#181311" : "#e7e1d4");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  applyTheme(currentTheme(), false);

  if (darkMedia.addEventListener) {
    darkMedia.addEventListener("change", function (event) {
      let saved = null;
      try { saved = localStorage.getItem("theme"); } catch (e) { /* ignora */ }
      if (!saved) applyTheme(event.matches ? "dark" : "light", false);
    });
  }

  /* ---------------- menu mobile ---------------- */
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");

    if (open) {
      const first = nav.querySelector("a");
      if (first) first.focus();
    } else if (nav.contains(document.activeElement)) {
      menuBtn.focus();
    }
  }

  if (nav && menuBtn) {
    menuBtn.addEventListener("click", function () {
      setMenu(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(e.target) || menuBtn.contains(e.target)) return;
      setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        setMenu(false);
        menuBtn.focus();
      }
    });
  }

  /* ---------------- link ativo ---------------- */
  const navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav a[href^='#']"));
  const sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function markActive() {
    if (!sections.length) return;
    const header = document.querySelector(".masthead");
    const offset = (header ? header.offsetHeight : 64) + 48;
    let current = null;

    sections.forEach(function (section) {
      const top = section.getBoundingClientRect().top + window.scrollY;
      if (top - offset <= window.scrollY) current = section;
    });

    // a última seção pode nunca alcançar o topo em páginas curtas
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom) current = sections[sections.length - 1];

    navLinks.forEach(function (a) {
      const match = current && a.getAttribute("href") === "#" + current.id;
      a.classList.toggle("active", !!match);
      if (match) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------------- parallax do monograma ---------------- */
  const monogramFigure = document.querySelector(".hero-mark");

  function updateParallax() {
    if (!monogramFigure || reduceMotion.matches) return;
    const rect = monogramFigure.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = window.innerHeight / 2 - center;
    const shift = Math.max(-18, Math.min(18, distance * 0.05));
    monogramFigure.style.transform = "translate3d(0," + shift.toFixed(2) + "px,0)";
  }

  /* ---------------- revelação das figuras ---------------- */
  const revealTargets = document.querySelectorAll(".system");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------------- âncoras com offset do header ---------------- */
  document.querySelectorAll("a[href^='#']").forEach(function (a) {
    a.addEventListener("click", function (e) {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      if (href === "#top") {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
        return;
      }

      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      if (href === "#conteudo") target.focus({ preventScroll: true });

      const header = document.querySelector(".masthead");
      const offset = (header ? header.offsetHeight : 64) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduceMotion.matches ? "auto" : "smooth" });
    });
  });

  /* ---------------- scroll ---------------- */
  let ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      updateParallax();
      markActive();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener("resize", function () {
    updateParallax();
    markActive();
  });

  /* ---------------- ano e estado inicial ---------------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  updateParallax();
  markActive();
})();
