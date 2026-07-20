// =======================================
// THÔNG TIN AI - script.js
// =======================================

const knowledgeContainer = document.getElementById("knowledgeContainer");
const knowledgeSection = document.getElementById("knowledge-section");
const knowledgeToggle = document.getElementById("knowledgeToggle");
const guideContainer = document.getElementById("guideContainer");
const guideSection = document.getElementById("guide-section");
const guideToggle = document.getElementById("guideToggle");
const toolContainer = document.getElementById("toolContainer");
const toolSection = document.getElementById("tool-section");
const professionContainer = document.getElementById("professionContainer");
const professionSection = document.getElementById("profession-section");
const rankingContainer = document.getElementById("rankingContainer");
const rankingSection = document.getElementById("ranking-section");
const homeToggle = document.getElementById("homeToggle");
const toolsToggle = document.getElementById("toolsToggle");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const sidebarItems = document.querySelectorAll(".sidebar li[data-category]");
const utilityItems = document.querySelectorAll(".utility-list li[data-utility]");
const darkModeBtn = document.getElementById("darkMode");
const langSelect = document.getElementById("langSelect");
const heroRobot = document.querySelector(".hero-robot");

let currentCategory = "all";
let specialFilter = null; // null | "newest" | "free"

// ---------- NGÔN NGỮ ----------
const supportedLanguages = ["vi", "en"];
let currentLang = supportedLanguages.includes(localStorage.getItem("lang")) ? localStorage.getItem("lang") : "vi";

function localizedText(value) {
  if (value && typeof value === "object") {
    return value[currentLang] || value.vi || value.en || "";
  }
  return value || "";
}

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.vi[key] || key;
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.title = t("site_title");
  document.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  if (heroRobot) {
    heroRobot.alt = t("robot_alt");
  }
}

langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  localStorage.setItem("lang", currentLang);
  applyTranslations();
  renderKnowledge();
  renderGuide();
  renderTools();
  renderProfession();
  renderRanking();
});

// ---------- RENDER KIẾN THỨC AI ----------
function renderKnowledge() {
  knowledgeContainer.innerHTML = aiKnowledge.map(item => `
    <div class="knowledge-card">
      <div class="knowledge-icon">${item.icon}</div>
      <h3>${localizedText(item.name)}</h3>
      ${
        Array.isArray(item.content)
          ? "<ul>" + item.content.map(x => `<li>${localizedText(x)}</li>`).join("") + "</ul>"
          : `<p>${localizedText(item.content)}</p>`
      }
    </div>
  `).join("");
}

// ---------- RENDER HƯỚNG DẪN SỬ DỤNG AI ----------
function renderGuide() {
  guideContainer.innerHTML = aiGuide.map(item => `
    <div class="knowledge-card">
      <div class="knowledge-icon">${item.icon}</div>
      <h3>${localizedText(item.name)}</h3>
      <p>${localizedText(item.content)}</p>
    </div>
  `).join("");
}

// ---------- RENDER AI THEO NGHỀ ----------
function renderProfession() {
  professionContainer.innerHTML = aiByProfession.map(item => `
    <div class="profession-card">
      <div class="knowledge-icon">${item.icon}</div>
      <h3>${localizedText(item.title)}</h3>
      <p class="profession-intro">${localizedText(item.intro)}</p>
      <ul class="profession-tasks">
        ${item.tasks.map(task => `<li>${localizedText(task)}</li>`).join("")}
      </ul>
      <div class="profession-suggest">
        <span class="suggest-label">${t("profession_suggest_label")}</span>
        <div class="chip-row">
          ${item.suggested.map(name => `<span class="chip" data-tool="${name}">${name}</span>`).join("")}
        </div>
      </div>
    </div>
  `).join("");

  // Bấm vào tên công cụ gợi ý -> tìm công cụ đó trong khu Công cụ AI
  professionContainer.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      searchInput.value = chip.dataset.tool;
      specialFilter = null;
      currentCategory = "all";
      clearSidebarActive();
      document.querySelector('.sidebar li[data-category="all"]').classList.add("active");
      renderTools();
      showSection("tools");
    });
  });
}

// ---------- RENDER BẢNG XẾP HẠNG AI ----------
function renderRanking() {
  const ranked = [...aiTools].sort((a, b) => b.rating - a.rating).slice(0, 15);

  rankingContainer.innerHTML = ranked.map((tool, idx) => {
    const pos = idx + 1;
    const posLabel = pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : pos;
    return `
      <div class="ranking-item">
        <div class="rank-pos ${pos <= 3 ? "rank-top" : ""}">${posLabel}</div>
        <div class="ranking-logo">
          <img class="tool-logo" data-fallback-icon="${tool.icon}"
               src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${tool.logo}.svg"
               alt="Logo ${tool.name}">
        </div>
        <div class="ranking-info">
          <h4>${tool.name}</h4>
          <span class="ranking-category">${t("cat_" + tool.category)}</span>
        </div>
        <div class="ranking-rating">⭐ ${tool.rating.toFixed(1)}</div>
        <a class="btn btn-free ranking-link" href="${tool.link}" target="_blank" rel="noopener">${t("btn_use")}</a>
      </div>
    `;
  }).join("");

  rankingContainer.querySelectorAll(".ranking-logo .tool-logo").forEach(img => {
    img.addEventListener("error", () => {
      const span = document.createElement("span");
      span.style.fontSize = "28px";
      span.textContent = img.dataset.fallbackIcon;
      img.replaceWith(span);
    }, { once: true });
  });
}

// ---------- CHUYỂN QUA LẠI GIỮA CÁC KHU VỰC (chỉ hiện 1 khu vực tại 1 thời điểm) ----------
function showSection(target) {
  const sections = {
    tools: toolSection,
    knowledge: knowledgeSection,
    guide: guideSection,
    profession: professionSection,
    ranking: rankingSection
  };

  // Ẩn tất cả khu vực, chỉ hiện đúng khu vực được chọn
  Object.entries(sections).forEach(([key, el]) => el.classList.toggle("hidden", key !== target));

  // Đánh dấu link đang active trên menu
  [homeToggle, knowledgeToggle, toolsToggle, guideToggle].forEach(link => link.classList.remove("active-link"));
  if (target === "knowledge") knowledgeToggle.classList.add("active-link");
  if (target === "guide") guideToggle.classList.add("active-link");
  if (target === "tools") { homeToggle.classList.add("active-link"); toolsToggle.classList.add("active-link"); }

  // Cuộn lên đúng đầu khu vực vừa hiện
  sections[target].scrollIntoView({ behavior: "smooth", block: "start" });
}

// ---------- SIDEBAR: BỎ TRẠNG THÁI ACTIVE Ở TẤT CẢ MỤC ----------
function clearSidebarActive() {
  sidebarItems.forEach(item => item.classList.remove("active"));
  utilityItems.forEach(item => item.classList.remove("active"));
}

// ---------- TRỞ VỀ TRẠNG THÁI MẶC ĐỊNH CỦA KHU CÔNG CỤ AI ----------
function resetToolsView() {
  specialFilter = null;
  currentCategory = "all";
  clearSidebarActive();
  document.querySelector('.sidebar li[data-category="all"]').classList.add("active");
  renderTools();
}

homeToggle.addEventListener("click", (e) => { e.preventDefault(); resetToolsView(); showSection("tools"); });
toolsToggle.addEventListener("click", (e) => { e.preventDefault(); resetToolsView(); showSection("tools"); });
knowledgeToggle.addEventListener("click", (e) => { e.preventDefault(); showSection("knowledge"); });
guideToggle.addEventListener("click", (e) => { e.preventDefault(); showSection("guide"); });

// ---------- TIỆN ÍCH: SO SÁNH / XẾP HẠNG / MỚI NHẤT / MIỄN PHÍ / THEO NGHỀ ----------
utilityItems.forEach(li => {
  li.addEventListener("click", () => {
    clearSidebarActive();
    li.classList.add("active");
    const type = li.dataset.utility;

    if (type === "ranking") {
      renderRanking();
      showSection("ranking");
    } else if (type === "profession") {
      renderProfession();
      showSection("profession");
    } else if (type === "newest") {
      specialFilter = "newest";
      currentCategory = "all";
      renderTools();
      showSection("tools");
    } else if (type === "free") {
      specialFilter = "free";
      currentCategory = "all";
      renderTools();
      showSection("tools");
    }
  });
});

// ---------- RENDER CÔNG CỤ AI ----------
function renderTools() {
  const badgeLabel = {
    free: t("badge_free"),
    pro: t("badge_pro"),
    hot: t("badge_hot")
  };

  const keyword = searchInput.value.trim().toLowerCase();

  let filtered = aiTools.filter(tool => {
    const matchCategory = specialFilter ? true : (currentCategory === "all" || tool.category === currentCategory);
    const matchSearch = tool.name.toLowerCase().includes(keyword) ||
                         localizedText(tool.description).toLowerCase().includes(keyword);
    const matchSpecial = specialFilter === "free" ? tool.badge === "free" : true;
    return matchCategory && matchSearch && matchSpecial;
  });

  // "AI mới nhất": sắp xếp theo id giảm dần, lấy 12 công cụ gần nhất
  if (specialFilter === "newest") {
    filtered = [...filtered].sort((a, b) => b.id - a.id).slice(0, 12);
  }

  const countLabel = document.getElementById("toolCount");
  if (countLabel) countLabel.textContent = t("tool_count").replace("{n}", filtered.length);

  if (filtered.length === 0) {
    toolContainer.innerHTML = `<div class="empty">${t("empty_search")}</div>`;
    return;
  }

  toolContainer.innerHTML = filtered.map(tool => `
    <div class="tool-card">
      <span class="badge ${tool.badge}">${badgeLabel[tool.badge] || ""}</span>
      <div class="tool-image">
        <img class="tool-logo" data-fallback-icon="${tool.icon}"
             src="https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${tool.logo}.svg"
             alt="Logo ${tool.name}">
      </div>
      <div class="tool-content">
        <h3>${tool.name}</h3>
        <div class="rating">⭐ <span>${tool.rating.toFixed(1)}/5</span></div>
        <p>${localizedText(tool.description)}</p>
        <div class="tool-buttons"><a class="btn btn-free" href="${tool.link}" target="_blank" rel="noopener">${t("btn_use")}</a></div>
      </div>
    </div>
  `).join("");

  // Nếu logo thật không tải được (không có trong kho) -> hiện icon emoji thay thế
  toolContainer.querySelectorAll(".tool-logo").forEach(img => {
    img.addEventListener("error", () => {
      const span = document.createElement("span");
      span.style.fontSize = "48px";
      span.textContent = img.dataset.fallbackIcon;
      img.replaceWith(span);
    }, { once: true });
  });
}

// ---------- SIDEBAR: LỌC DANH MỤC ----------
sidebarItems.forEach(li => {
  li.addEventListener("click", () => {
    clearSidebarActive();
    li.classList.add("active");
    currentCategory = li.dataset.category;
    specialFilter = null;
    renderTools();
    showSection("tools");
  });
});

// ---------- TÌM KIẾM ----------
searchBtn.addEventListener("click", renderTools);
searchInput.addEventListener("keyup", e => {
  if (e.key === "Enter") renderTools();
  else renderTools();
});

// ---------- DARK MODE ----------
function applyDarkMode(isDark) {
  document.body.classList.toggle("dark", isDark);
  darkModeBtn.textContent = isDark ? "☀️" : "🌙";
}

darkModeBtn.addEventListener("click", () => {
  const isDark = !document.body.classList.contains("dark");
  applyDarkMode(isDark);
  localStorage.setItem("darkMode", isDark ? "1" : "0");
});

// Khôi phục trạng thái dark mode đã lưu
applyDarkMode(localStorage.getItem("darkMode") === "1");

// ---------- KHỞI CHẠY ----------
document.addEventListener("DOMContentLoaded", () => {
  // Đánh dấu mục "Tất cả AI" đang active mặc định
  sidebarItems.forEach(item => item.classList.remove("active"));
  document.querySelector('.sidebar li[data-category="all"]').classList.add("active");

  // Khôi phục ngôn ngữ đã lưu
  langSelect.value = supportedLanguages.includes(currentLang) ? currentLang : "vi";
  applyTranslations();

  renderKnowledge();
  renderGuide();
  renderTools();
  renderProfession();
  renderRanking();
  showSection("tools");
});
