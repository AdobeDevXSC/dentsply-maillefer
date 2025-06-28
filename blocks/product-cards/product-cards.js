import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const link = block.querySelector('a');
  let data = [];

  if (!link) return;

  function modifyHTML() {
    block.innerHTML = '';

    const ul = document.createElement('ul');

    data.forEach((item) => {
      const picture = createOptimizedPicture(item.image, item.title, false, [{ width: 800 }]);
      picture.lastElementChild.width = '800';
      picture.lastElementChild.height = '800';
      const createdCard = document.createElement('li');
      createdCard.innerHTML = `
        <a href="${item.URL}" class="cards-card-image" aria-label="${item['ProductName']}">
          <div data-align="center">${picture.outerHTML}</div>
        </a>
        <div class="cards-card-body">
          <h5>${item.ProductName}</h5>
        </div>
      `;
      ul.append(createdCard);
    });

    block.append(ul);
  }

  async function initialize() {
    const response = await fetch(link?.href);

    if (response.ok) {
      const jsonData = await response.json();
      data = jsonData?.data;
      console.log("data: ", data);
      modifyHTML();
    }
  }

  initialize();
}