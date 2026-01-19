let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // 1. Popüler Hero (3 Ürün)
            renderHero(allProducts.filter(p => p.p_pop === true).slice(0, 3));
            
            // 2. Marka Listelerini Hazırla
            setupBrandDropdowns();
        })
        .catch(err => console.error("Hata:", err));
});

// SADECE GÖRSEL - ASİMETRİK HERO RENDER
function renderHero(products) {
    const container = document.getElementById("popular-layout");
    if (!container || products.length < 3) return;

    // Örnek site mantığı: 1 büyük, 2 küçük
    container.innerHTML = `
        <div class="hero-item item-big">
            <img src="${products[0].p_url || products[0].p_img}" alt="Popular 1">
        </div>
        <div class="hero-item">
            <img src="${products[1].p_url || products[1].p_img}" alt="Popular 2">
        </div>
        <div class="hero-item">
            <img src="${products[2].p_url || products[2].p_img}" alt="Popular 3">
        </div>
    `;
}

// Navigasyon üzerine gelince markaları göster
function showBrands(category) {
    const brands = [...new Set(allProducts.filter(p => p.p_cat === category).map(p => p.p_brand))];
    const dropdownId = category.startsWith("Plastik") ? "brands-Plastik" : 
                       category.startsWith("Promosyon") ? "brands-Promosyon" :
                       category.startsWith("Metal") ? "brands-Metal" : "brands-Diger";
    
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.innerHTML = brands.map(b => 
            `<a href="#" class="brand-link" onclick="filterByBrand('${b}', '${category}')">${b}</a>`
        ).join('');
    }
}

function filterByBrand(brand, category) {
    const filtered = allProducts.filter(p => p.p_brand === brand && p.p_cat === category);
    renderGeneralList(filtered, brand);
}

function filterByCategory(category) {
    const filtered = allProducts.filter(p => p.p_cat === category);
    renderGeneralList(filtered, category);
}

// Genel Liste Render (Hero dışındaki filtre sonuçları için)
function renderGeneralList(products, title) {
    // Hero kısmını sonuçlarla değiştiriyoruz
    const container = document.getElementById("popular-hero-section") || document.querySelector(".popular-hero");
    container.innerHTML = `<h2>${title} Modelleri</h2><div class="general-grid" id="general-list"></div>`;
    
    const list = document.getElementById("general-list");
    list.style.display = "grid";
    list.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
    list.style.gap = "20px";

    list.innerHTML = products.map(p => `
        <div class="product-card" style="border: 1px solid #eee; padding: 10px; border-radius: 8px; text-align: center;">
            <img src="${p.p_url || p.p_img}" style="width:100%; height:200px; object-fit:contain;">
            <h4>${p.p_name}</h4>
            <p>${p.p_brand}</p>
        </div>
    `).join('');
}