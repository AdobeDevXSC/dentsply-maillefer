
function fetchQueryJSON() {
  const QUERY_PATH = '/products/query-index.json';

}

function createProductMenuSidebar(section, data) {
  const html = `
    <div class="product-side-menu">
      Product Side Menu Placeholder
    </div>
  `;

  section.insertAdjacentHTML('beforebegin', html);
}

(function decorateTemplate() {
  const mainSection = document.body.querySelector('main > div');
  mainSection.classList.add('product-cards-section');

  const data = [];

  createProductMenuSidebar(mainSection, data);
}());