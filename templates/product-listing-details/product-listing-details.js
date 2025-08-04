import { isAuthorEnvironment } from '../../scripts/scripts.js';

async function fetchQueryJSON() {
  const QUERY_PATH = '/products/query-index.json';
  const resp = await fetch(QUERY_PATH);
  if (!resp.ok) throw new Error('Could not fetch query index');
  const { data } = await resp.json();
  return data;
}

function formatTitle(str) {
  return str
    .replace(/-/g, ' ')
    .replace(/\band\b/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, l => l.toUpperCase());
}

function groupAndSortData(data) {
  const grouped = {};

  data
    .filter(item => {
      // Filter out '/products/' only (with or without trailing slash)
      const path = item.path.replace(/\/+$/, ''); // remove trailing slashes
      const segments = path.split('/').filter(Boolean);
      return segments.length > 1; // must have more than just 'products'
    })
    .forEach(item => {
      const segments = item.path.split('/').filter(Boolean);
      const categoryKey = segments[1] || 'uncategorized';

      if (!grouped[categoryKey]) grouped[categoryKey] = [];
      grouped[categoryKey].push(item);
    });

  const sortedGrouped = {};
  Object.keys(grouped)
    .sort((a, b) => formatTitle(a).localeCompare(formatTitle(b)))
    .forEach(key => {
      sortedGrouped[key] = grouped[key].sort((a, b) =>
        formatTitle(a.title).localeCompare(formatTitle(b.title))
      );
    });

  return sortedGrouped;
}


function createAccordionMenu(section, groupedData) {
  const container = document.createElement('div');
  container.className = 'product-side-menu';

  Object.entries(groupedData).forEach(([categoryKey, items]) => {
    const categoryTitle = formatTitle(categoryKey);

    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'menu-category';

    const header = document.createElement('div');
    header.className = 'menu-title-wrap';

    // Find the actual top-level category item (longest common prefix match)
    const categoryItem = items.find(item => {
      const parts = item.path.split('/').filter(Boolean);
      return parts.length === 2 && parts[1] === categoryKey;
    });

    // Filter out the categoryItem from its children
    const children = items.filter(item => item !== categoryItem);

    // Use fallback if no top-level item (still create one, but won't link)
    const isAuthorEnv = isAuthorEnvironment();
    const titleLink = document.createElement('a');
    titleLink.href = isAuthorEnv ? `/content/dentsply-maillefer/${categoryItem?.path}` : categoryItem?.path || '#';
    titleLink.className = 'menu-title';
    titleLink.textContent = categoryTitle;
    header.appendChild(titleLink);

    // If children exist, add accordion toggle + submenu
    if (children.length > 0) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'accordion-toggle';
      toggleBtn.setAttribute('aria-label', 'Toggle Submenu');
      toggleBtn.innerHTML = '+';

      toggleBtn.addEventListener('click', () => {
        const isOpen = categoryDiv.classList.toggle('open');
        toggleBtn.innerHTML = isOpen ? '-' : '+';
      });

      header.prepend(toggleBtn);

      const submenu = document.createElement('ul');
      submenu.className = 'submenu';

      children.forEach(child => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${child.path}">${formatTitle(child.title)}</a>`;
        submenu.appendChild(li);
      });

      categoryDiv.appendChild(header);
      categoryDiv.appendChild(submenu);
    } else {
      // No children → just header
      categoryDiv.appendChild(header);
    }

    container.appendChild(categoryDiv);
  });

  section.insertAdjacentElement('beforebegin', container);
}

(async function decorateTemplate() {
  const mainSection = document.querySelector('main > div');
  mainSection.classList.add('product-cards-section');

  const data = await fetchQueryJSON();
  const grouped = groupAndSortData(data);
  createAccordionMenu(mainSection, grouped);
})();
