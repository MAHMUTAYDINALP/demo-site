let allProducts = [];
window.selectedCategory = "";

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            // İlk açılışta sadece popüler olanları göster
            renderProducts(allProducts.filter(p => p.p_pop));
            setupSearch();
        })
        .catch(err => console.error("Ürünler yüklenirken hata:", err));
});

function renderProducts(products) {
    const container = document.getElementById("popular-products");
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = "<p>Aradığınız kriterlerde ürün bulunamadı.</p>";
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}">
            <div class="p-info">
                <small>${p.p_brand}</small>
                <h3>${p.p_name}</h3>
                <p style="font-size: 13px; color: #666;">${p.p_desc || ''}</p>
                <span style="background: #f0f0f0; padding: 4px 10px; border-radius: 10px; font-size: 12px;">${p.p_cat}</span>
            </div>
        </div>
    `).join('');
}

function showBrands(category) {
    window.selectedCategory = category;
    document.getElementById("brand-panel").style.display = "flex";
    document.getElementById("section-title").innerText = category;
    
    // Kategoriye ait ürünleri hemen göster
    const filtered = allProducts.filter(p => p.p_cat === category);
    renderProducts(filtered);
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function closeBrands() {
    document.getElementById("brand-panel").style.display = "none";
}

function filterByBrand(brand) {
    const filtered = allProducts.filter(p => p.p_brand === brand && p.p_cat === window.selectedCategory);
    document.getElementById("section-title").innerText = `${window.selectedCategory} > ${brand}`;
    renderProducts(filtered);
    closeBrands();
}

function setupSearch() {
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.p_name.toLowerCase().includes(term) || 
            p.p_brand.toLowerCase().includes(term) ||
            p.p_cat.toLowerCase().includes(term)
        );
        renderProducts(filtered);
    });
}