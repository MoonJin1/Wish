/* ============================================================
   위시 · 링크 페이지 동작 코드
   (보통은 이 파일을 고칠 필요가 없습니다. 내용은 config.js 에서 바꾸세요.)
   ============================================================ */

(function () {
  "use strict";

  /* ---------- 기본값 ---------- */
  var FALLBACK = {
    name: "위시",
    bio: "",
    avatar: "",
    links: [],
    theme: {},
    footer: "",
  };

  var configFailed = false;

  function readConfig() {
    try {
      if (typeof config !== "undefined" && config && typeof config === "object") {
        return config;
      }
    } catch (e) {
      /* config.js 에 오타가 있으면 여기로 옵니다. */
      configFailed = true;
      console.warn("[위시] config.js 를 읽지 못했습니다. 따옴표와 쉼표를 확인하세요.", e);
    }
    configFailed = true;
    return {};
  }

  var raw = readConfig();

  var site = {
    name: toText(raw.name) || FALLBACK.name,
    bio: toText(raw.bio),
    avatar: toText(raw.avatar),
    links: Array.isArray(raw.links) ? raw.links : [],
    theme: raw.theme && typeof raw.theme === "object" ? raw.theme : {},
    footer: toText(raw.footer),
  };

  function toText(value) {
    return value === null || value === undefined ? "" : String(value).trim();
  }

  /* ---------- 색 ---------- */
  function isColor(value) {
    if (!value) return false;
    if (window.CSS && window.CSS.supports && window.CSS.supports("color", value)) return true;
    // CSS.supports 를 쓸 수 없는 아주 오래된 브라우저용 간단한 확인
    return /^(#[0-9a-f]{3,8}|rgb|hsl|oklch|lab)/i.test(value);
  }

  function applyTheme(theme) {
    var root = document.documentElement;
    if (isColor(theme.accent)) root.style.setProperty("--accent", theme.accent);
    if (isColor(theme.accent2)) root.style.setProperty("--accent-2", theme.accent2);
  }

  /* ---------- 주소 정리 ---------- */
  function normalizeUrl(value) {
    var url = toText(value);
    if (!url) return "";
    if (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) return url;
    return "https://" + url;
  }

  function isExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  /* ---------- 아이콘 ---------- */
  var STROKE = 'fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"';

  var ICONS = {
    github:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.73.5.9 5.33.9 11.6c0 4.9 3.17 9.05 7.57 10.52.55.1.75-.24.75-.53v-2.06c-3.08.67-3.73-1.3-3.73-1.3-.5-1.28-1.23-1.62-1.23-1.62-1-.69.08-.68.08-.68 1.11.08 1.7 1.14 1.7 1.14.99 1.7 2.6 1.21 3.23.93.1-.72.39-1.21.7-1.49-2.46-.28-5.05-1.23-5.05-5.48 0-1.21.43-2.2 1.14-2.98-.12-.28-.5-1.41.1-2.94 0 0 .93-.3 3.05 1.14a10.5 10.5 0 0 1 5.55 0c2.12-1.44 3.05-1.14 3.05-1.14.6 1.53.22 2.66.11 2.94.71.78 1.14 1.77 1.14 2.98 0 4.26-2.6 5.2-5.07 5.47.4.35.76 1.03.76 2.08v3.08c0 .3.2.64.76.53 4.4-1.47 7.56-5.62 7.56-10.52C23.1 5.33 18.27.5 12 .5z"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5.2" ' +
      STROKE +
      '/><circle cx="12" cy="12" r="4" ' +
      STROKE +
      '/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor"/></svg>',
    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4.2" ' +
      STROKE +
      '/><path fill="currentColor" d="M10.4 9.1v5.8l5-2.9z"/></svg>',
    x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    blog:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h9.5L19 9v10.5H5z" ' +
      STROKE +
      '/><path d="M8 9.5h5M8 13h8M8 16.5h5" ' +
      STROKE +
      '/></svg>',
    link:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1.6 1.6" ' +
      STROKE +
      '/><path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1.6-1.6" ' +
      STROKE +
      '/></svg>',
  };

  var ARROW =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" ' +
    STROKE +
    "/></svg>";

  function iconFor(name) {
    var key = toText(name).toLowerCase();
    return ICONS[key] || ICONS.link;
  }

  /* ---------- 머리글 ---------- */
  function renderProfile() {
    var nameEl = document.getElementById("name");
    var bioEl = document.getElementById("bio");
    var avatarEl = document.getElementById("avatar");

    if (nameEl) nameEl.textContent = site.name;
    if (bioEl) {
      if (site.bio) {
        bioEl.textContent = site.bio;
      } else if (!configFailed) {
        // 소개 문구를 비워두면 그 줄만 사라집니다.
        bioEl.remove();
      }
    }

    document.title = site.name;

    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && site.bio) metaDesc.setAttribute("content", site.bio);

    if (!avatarEl) return;

    var inner = document.createElement("div");
    inner.className = "avatar-inner";

    if (site.avatar) {
      var img = document.createElement("img");
      img.src = site.avatar;
      img.alt = "";
      img.decoding = "async";
      img.addEventListener("error", function () {
        // 사진을 못 불러오면 첫 글자로 대체
        img.remove();
        inner.textContent = monogram();
      });
      inner.appendChild(img);
    } else {
      inner.textContent = monogram();
    }

    avatarEl.setAttribute("aria-hidden", "true");
    avatarEl.appendChild(inner);
  }

  function monogram() {
    var first = site.name.replace(/\s+/g, "").charAt(0);
    return first || "위";
  }

  /* ---------- 링크 ---------- */
  function renderLinks() {
    var wrap = document.getElementById("links");
    if (!wrap) return;

    var canHover =
      window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var shown = 0;

    site.links.forEach(function (item) {
      if (!item || typeof item !== "object") return;

      var url = normalizeUrl(item.url);
      if (!url) return;

      var label = toText(item.label) || url;
      var desc = toText(item.description);

      var a = document.createElement("a");
      a.className = "link-card animate";
      a.href = url;
      a.style.setProperty("--i", String(shown + 3));

      if (isExternal(url)) {
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      }

      var icon = document.createElement("span");
      icon.className = "link-icon";
      icon.innerHTML = iconFor(item.icon);

      var text = document.createElement("span");
      text.className = "link-text";

      var labelEl = document.createElement("span");
      labelEl.className = "link-label";
      labelEl.textContent = label;
      text.appendChild(labelEl);

      if (desc) {
        var descEl = document.createElement("span");
        descEl.className = "link-desc";
        descEl.textContent = desc;
        text.appendChild(descEl);
      }

      var arrow = document.createElement("span");
      arrow.className = "link-arrow";
      arrow.innerHTML = ARROW;

      a.appendChild(icon);
      a.appendChild(text);
      a.appendChild(arrow);

      if (canHover) {
        a.addEventListener("pointermove", function (event) {
          var rect = a.getBoundingClientRect();
          if (!rect.width || !rect.height) return;
          var x = ((event.clientX - rect.left) / rect.width) * 100;
          var y = ((event.clientY - rect.top) / rect.height) * 100;
          a.style.setProperty("--mx", x.toFixed(1) + "%");
          a.style.setProperty("--my", y.toFixed(1) + "%");
        });
        a.addEventListener("pointerleave", function () {
          a.style.setProperty("--mx", "50%");
          a.style.setProperty("--my", "0%");
        });
      }

      wrap.appendChild(a);
      shown += 1;
    });

    if (shown === 0) {
      var empty = document.createElement("p");
      empty.className = "empty animate";
      empty.textContent = configFailed
        ? "config.js 를 읽지 못했어요. 마지막으로 고친 곳의 따옴표와 쉼표를 확인해 주세요."
        : "아직 링크가 없어요. config.js 의 links 에 주소를 추가해 보세요.";
      wrap.appendChild(empty);
    }

    return shown;
  }

  /* ---------- 푸터 ---------- */
  function renderFooter(count) {
    var el = document.getElementById("footer-text");
    if (!el) return;
    el.textContent = site.footer || "© " + site.name;
    el.style.setProperty("--i", String((count || 0) + 3));
  }

  /* ---------- 실행 ---------- */
  applyTheme(site.theme);
  renderProfile();
  var linkCount = renderLinks();
  renderFooter(linkCount);
})();
