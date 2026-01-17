document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            console.log("Gelen veri:", data); // Veriyi kontrol etmek için

            // Admin paneli veriyi "products" anahtarı altına koyar
            const productList = data.products || []; 
            const popularContainer = document.getElementById("popular-products");

            if (!popularContainer) return;
            popularContainer.innerHTML = ""; // İçini temizle

            productList.forEach(product => {
                if (product.popular) {
                    const card = document.createElement("div");
                    card.className = "product-card";
                    card.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <span class="cat-tag">${product.category}</span>
                    `;
                    popularContainer.appendChild(card);
                }
            });
        })
        .catch(err => {
            console.error("Veri yüklenirken hata oluştu:", err);
            document.getElementById("popular-products").innerHTML = "Henüz ürün eklenmemiş.";
        });
});