fetch("data/product.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("product-list");

    data.forEach(product => {
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
  })
  .catch(err => console.error("JSON okunamadı", err));
