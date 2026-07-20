// Chi tiết công cụ AI
const supportedLanguages = ['vi', 'en'];
let currentLang = supportedLanguages.includes(localStorage.getItem('lang')) ? localStorage.getItem('lang') : 'vi';

function localizedText(value) {
  if (value && typeof value === 'object') {
    return value[currentLang] || value.vi || value.en || '';
  }
  return value || '';
}

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.vi[key] || key;
}

// Load tool details
function loadToolDetail() {
  const params = new URLSearchParams(window.location.search);
  const toolId = parseInt(params.get('id'));
  const tool = aiTools.find(t => t.id === toolId);

  if (!tool) {
    document.body.innerHTML = '<h1>Công cụ không tìm thấy</h1>';
    return;
  }

  // Set basic info
  document.getElementById('detailName').textContent = tool.name;
  document.getElementById('detailIcon').textContent = tool.icon;
  document.getElementById('detailCategory').textContent = t('cat_' + tool.category);
  document.getElementById('detailBadge').textContent = t('badge_' + tool.badge);
  document.getElementById('detailBadge').className = 'badge ' + tool.badge;
  document.getElementById('detailIntro').textContent = localizedText(tool.description);
  document.getElementById('detailLink').href = tool.link;

  // Set logo
  const logoImg = document.getElementById('detailLogo');
  logoImg.src = `https://unpkg.com/@lobehub/icons-static-svg@latest/icons/${tool.logo}.svg`;
  logoImg.onerror = () => {
    logoImg.style.display = 'none';
  };

  // Set rating
  const starsDisplay = document.getElementById('starsDisplay');
  const stars = '⭐'.repeat(Math.round(tool.rating));
  starsDisplay.textContent = stars;
  document.getElementById('ratingValue').textContent = tool.rating.toFixed(1) + '/5';

  // Set advantages
  const advantages = tool.advantages || defaultAdvantages(tool.category);
  document.getElementById('advantagesList').innerHTML = advantages.map(adv => `<li>${adv}</li>`).join('');

  // Set disadvantages
  const disadvantages = tool.disadvantages || defaultDisadvantages();
  document.getElementById('disadvantagesList').innerHTML = disadvantages.map(dis => `<li>${dis}</li>`).join('');

  // Set usage
  const usage = tool.usage || defaultUsage();
  document.getElementById('usageList').innerHTML = usage.map(u => `<li>${u}</li>`).join('');

  // Set price
  const price = tool.price || defaultPrice(tool.badge);
  const priceHTML = Object.entries(price).map(([key, val]) => 
    `<div class="price-item"><span class="price-label">${t('price_' + key)}</span><span class="price-value">${val}</span></div>`
  ).join('');
  document.getElementById('priceInfo').innerHTML = priceHTML;

  // Favorite functionality
  const favoriteBtn = document.getElementById('favoriteBtn');
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  const isFavorited = favorites.includes(toolId);

  if (isFavorited) {
    favoriteBtn.classList.add('favorited');
    favoriteBtn.querySelector('i').className = 'fas fa-heart';
  }

  favoriteBtn.addEventListener('click', () => {
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const index = favorites.indexOf(toolId);

    if (index > -1) {
      favorites.splice(index, 1);
      favoriteBtn.classList.remove('favorited');
      favoriteBtn.querySelector('i').className = 'far fa-heart';
    } else {
      favorites.push(toolId);
      favoriteBtn.classList.add('favorited');
      favoriteBtn.querySelector('i').className = 'fas fa-heart';
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavCount();
  });

  updateFavCount();
}

function updateFavCount() {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  document.getElementById('favCount').textContent = `${favorites.length} ${t('favorite_count')}`;
}

function defaultAdvantages(category) {
  const advantages = {
    chat: ['Đa năng, hỗ trợ nhiều tác vụ', 'Giao diện thân thiện', 'Phản hồi nhanh chóng', 'Miễn phí hoặc giá rẻ'],
    image: ['Chất lượng hình ảnh cao', 'Tạo được nhiều phong cách', 'Dễ sử dụng', 'Tốc độ xử lý nhanh'],
    video: ['Tạo video chuyên nghiệp', 'Hỗ trợ nhiều định dạng', 'Giao diện trực quan', 'Kết quả chất lượng cao'],
    code: ['Tăng tốc độ lập trình', 'Tự động hoàn thành mã', 'Hỗ trợ nhiều ngôn ngữ', 'Giảm lỗi code'],
    finance: ['Phân tích dữ liệu chính xác', 'Cập nhật thị trường thực tme', 'Dự báo xu hướng', 'Giao diện chuyên nghiệp'],
    study: ['Hỗ trợ học tập hiệu quả', 'Đa dạng nội dung', 'Tương tác cao', 'Giá cả hợp lý']
  };
  return advantages[category] || ['Công cụ tuyệt vời', 'Dễ sử dụng', 'Hiệu quả cao', 'Hỗ trợ tốt'];
}

function defaultDisadvantages() {
  return [
    'Cần kết nối internet ổn định',
    'Một số tính năng yêu cầu trả phí',
    'Có thể chứa sai sót',
    'Cần hiểu biết cơ bản về lĩnh vực'
  ];
}

function defaultUsage() {
  return [
    'Đăng ký hoặc đăng nhập tài khoản',
    'Chọn mục đích sử dụng phù hợp',
    'Nhập yêu cầu hoặc upload tệp tin',
    'Chờ xử lý và nhận kết quả',
    'Tải xuống hoặc chia sẻ kết quả'
  ];
}

function defaultPrice(badge) {
  const prices = {
    free: { free: t('price_free_value'), basic: t('price_free_value'), premium: 'Từ $10/tháng' },
    pro: { basic: 'Từ $10/tháng', pro: 'Từ $20/tháng', enterprise: 'Liên hệ' },
    hot: { free: t('price_free_value'), premium: 'Từ $15/tháng' }
  };
  return prices[badge] || { free: t('price_free_value'), premium: 'Liên hệ' };
}

// Dark mode
function applyDarkMode(isDark) {
  document.body.classList.toggle('dark', isDark);
  document.getElementById('darkMode').textContent = isDark ? '☀️' : '🌙';
}

document.getElementById('darkMode').addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  applyDarkMode(isDark);
  localStorage.setItem('darkMode', isDark ? '1' : '0');
});

applyDarkMode(localStorage.getItem('darkMode') === '1');

// Translations
function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  loadToolDetail();
}

document.getElementById('langSelect').addEventListener('change', () => {
  currentLang = document.getElementById('langSelect').value;
  localStorage.setItem('lang', currentLang);
  applyTranslations();
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('langSelect').value = currentLang;
  applyTranslations();
});
