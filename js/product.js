fetch("data/products.json")
  .then(res => res.json())
  .then(data => {
    const popularContainer = document.getElementById("popular-products");
    const categoryContainer = document.getElementById("category-list");

    // POPÜLER ÜRÜNLER
    data.filter(p => p.popular).forEach(product => {
      popularContainer.innerHTML += `
        <div class="product-card">
          <img src="${product.image}">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
        </div>
      `;
    });

    // KATEGORİLER (tekrar etmeyecek)
    const categories = [...new Set(data.map(p => p.category))];
    categories.forEach(cat => {
      categoryContainer.innerHTML += `
        <div class="category-card">
          <h4>${cat}</h4>
        </div>
      `;
    });
  });
