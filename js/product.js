document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            const products = data.products; // JSON içindeki liste
            const popularContainer = document.getElementById("popular-products");
            const categoryContainer = document.getElementById("category-list");

            products.forEach(product => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <span class="cat-tag">${product.category}</span>
                `;

                // Popüler modeller kısmına ekle
                if (product.popular && popularContainer) {
                    popularContainer.appendChild(card.cloneNode(true));
                }
            });
        })
        .catch(err => console.error("Veri yüklenirken hata oluştu:", err));
});