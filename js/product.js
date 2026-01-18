

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // 1. Ana sayfadaki Slider için SADECE popüler olanları filtrele
            const populars = allProducts.filter(p => p.is_popular === true);
            renderProducts(populars, "popular-products");

            // 2. Sayfanın altındaki Kategori kartlarını hazırla
            setupSearch();
            if(typeof startAutoSlider === "function") startAutoSlider();
        })
        .catch(err => console.error("Veri çekme hatası:", err));
});

// Ürünleri Listeleme Fonksiyonu
function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = "<p>Bu kategoride henüz ürün bulunmamaktadır.</p>";
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card" onclick="openProductDetail('${product.product_name}')">
            <img src="${product.image_url || product.image_file}" alt="${product.product_name}">
            <h3>${product.product_name}</h3>
            <p>${product.description}</p>
            <span class="cat-tag">${product.category}</span>
        </div>
    `).join('');
}

// Kategoriye Tıklayınca Çalışacak Fonksiyon
function filterByCategory(categoryName) {
    // Ürün hem popüler olabilir hem olmayabilir, ama kategori eşleşiyorsa getirir
    const filtered = allProducts.filter(p => p.category === categoryName);
    
    // Başlığı değiştir ve ürünleri bas
    const sectionTitle = document.querySelector(".popular h2");
    if(sectionTitle) sectionTitle.innerText = categoryName;
    
    renderProducts(filtered, "popular-products");
    
    // Ürünlerin olduğu bölüme yumuşak geçiş yap
    window.scrollTo({ top: 450, behavior: 'smooth' });
}

let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            // İlk açılışta popülerleri göster
            renderProducts(allProducts.filter(p => p.p_pop), "popular-products");
        });
});

function renderProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.p_url || product.p_img}" alt="${product.p_name}">
            <div class="card-info">
                <small>${product.p_brand}</small>
                <h3>${product.p_name}</h3>
                <span class="cat-tag">${product.p_cat}</span>
            </div>
        </div>
    `).join('');
}

function filterByBrand(brand) {
    const filtered = allProducts.filter(p => p.p_brand === brand);
    document.querySelector(".popular h2").innerText = brand + " Modelleri";
    renderProducts(filtered, "popular-products");
}