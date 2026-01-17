document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            // Admin panelinden gelen liste "products" içindedir
            const products = data.products || []; 
            const popularContainer = document.getElementById("popular-products");

            if (!popularContainer) return;
            popularContainer.innerHTML = ""; 

            products.forEach(product => {
                // Sadece "Popüler" işaretlenenleri ana sayfaya bas
                if (product.popular) {
                    const card = document.createElement("div");
                    card.className = "product-card";
                    card.innerHTML = `
                        <img src="${product.image}" alt="${product.name}" style="width:100%; aspect-ratio:1080/1350; object-fit:cover;">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <span class="cat-tag">${product.category}</span>
                    `;
                    popularContainer.appendChild(card);
                }
            });
        })
        .catch(err => console.error("Ürünler yüklenirken hata:", err));
});