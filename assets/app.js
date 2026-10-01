(() => {
  const config = window.DASH_CONFIG || { links: [] };
  const links = Array.isArray(config.links) ? config.links : [];
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  const search = $('search-input');
  const categoriesEl = $('category-list');
  const grid = $('card-grid');
  const empty = $('empty-state');
  const sectionTitle = $('section-title');
  const resultCount = $('result-count');

  $('site-title').textContent = config.siteTitle || 'Dash';
  $('site-description').textContent = config.description || '';
  $('footer-text').textContent = config.footer || 'Dash · Personal Navigation';
  document.title = config.siteTitle || 'Dash';

  let active = '全部';
  let keyword = '';
  const categories = ['全部', ...new Set(links.map(x => x.category).filter(Boolean))];

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');

  function filteredLinks() {
    const q = keyword.toLowerCase();
    return links.filter(item => {
      const inCategory = active === '全部' || item.category === active;
      const text = [item.title, item.description, item.category, item.badge].filter(Boolean).join(' ').toLowerCase();
      return inCategory && (!q || text.includes(q));
    });
  }

  function renderCategories() {
    categoriesEl.innerHTML = categories.map(category =>
      `<button class="category-button ${category === active ? 'active' : ''}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
    ).join('');
  }

  function renderCards() {
    const list = filteredLinks();
    sectionTitle.textContent = active === '全部' ? '全部服务' : active;
    resultCount.textContent = `${list.length} 个入口`;
    empty.hidden = list.length !== 0;

    grid.innerHTML = list.map(item => {
      const accent = item.accent || '#2563eb';
      const icon = item.icon || (item.title ? item.title.slice(0, 2).toUpperCase() : '↗');
      const badge = item.badge ? `<span class="badge">${escapeHtml(item.badge)}</span>` : '';
      return `
        <a class="link-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" style="--accent:${escapeHtml(accent)}">
          <div class="card-top">
            <div class="card-icon">${escapeHtml(icon)}</div>
            <div class="card-arrow" aria-hidden="true">↗</div>
          </div>
          <div class="card-copy">
            <div class="card-title-row"><h3 class="card-title">${escapeHtml(item.title || 'Untitled')}</h3>${badge}</div>
            <p class="card-description">${escapeHtml(item.description || '点击打开服务')}</p>
            <div class="card-category">${escapeHtml(item.category || '未分类')}</div>
          </div>
        </a>`;
    }).join('');
  }

  function render() { renderCategories(); renderCards(); }

  categoriesEl.addEventListener('click', e => {
    const button = e.target.closest('[data-category]');
    if (!button) return;
    active = button.dataset.category;
    render();
  });

  search.addEventListener('input', e => {
    keyword = e.target.value.trim();
    renderCards();
  });

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== search) {
      e.preventDefault();
      search.focus();
    } else if (e.key === 'Escape' && document.activeElement === search) {
      search.value = '';
      keyword = '';
      search.blur();
      renderCards();
    }
  });

  function applyTheme(theme) {
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }

  const saved = localStorage.getItem('dash-theme');
  const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(saved || preferred);

  $('theme-toggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('dash-theme', next);
  });

  render();
})();
