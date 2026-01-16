if (!document.getElementById("product-list")) return;

fetch("data/products-index.json")
  .then(res => res.json())
  .then(files => {
    return Promise.all(
      files.map(file =>
        fetch(`data/${file}`).then(res => res.json())
      )
    );
  })
  .then(products => {
    const container = document.getElementById("product-list");

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span>${product.category}</span>
      `;

      container.appendChild(card);
    });
  });
