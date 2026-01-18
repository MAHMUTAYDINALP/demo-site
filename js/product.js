let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            renderProducts(allProducts.filter(p => p.popular), "popular-products");
            setupSearch();
        });

    // İletişim Modal Kontrolü
    const modal = document.getElementById("contact-modal");
    document.querySelector(".contact-btn").onclick = () => modal.style.display = "block";
    document.querySelector(".close-modal").onclick = () => modal.style.display = "none";
});

// Ürünleri Ekrana Basma Fonksiyonu
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image_url || product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="cat-tag">${product.category}</span>
        </div>
    `).join('');
}

// Arama Motoru
function setupSearch() {
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.name.toLowerCase().includes(term) || 
            p.category.toLowerCase().includes(term)
        );
        // Arama yapıldığında popüler kısmını arama sonuçlarıyla değiştir
        document.querySelector(".popular h2").innerText = term ? "Arama Sonuçları" : "Popüler Modellerimiz";
        renderProducts(term ? filtered : allProducts.filter(p => p.popular), "popular-products");
    });
}

// Kategori Filtreleme (HTML'deki butonlar için)
function filterByCategory(category) {
    const filtered = allProducts.filter(p => p.category === category);
    document.querySelector(".popular h2").innerText = category;
    renderProducts(filtered, "popular-products");
    window.scrollTo({ top: 400, behavior: 'smooth' }); // Ürünlere kaydır
}

function startAutoSlider() {
    const slider = document.getElementById("popular-products");
    let scrollAmount = 0;
    
    setInterval(() => {
        if (!slider) return;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        
        if (scrollAmount >= maxScroll) {
            scrollAmount = 0; // Başa dön
        } else {
            scrollAmount += slider.clientWidth / 2; // Yarım sayfa kaydır
        }
        
        slider.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }, 7000); // 7 saniyede bir kayar
}

// Bunu DOMContentLoaded içindeki fetch bittikten sonra çağıracağız.
// fetch kısmına şunu ekle: .then(() => startAutoSlider());