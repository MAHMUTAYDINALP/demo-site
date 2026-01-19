let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // 1. Popüler Görsel Grid (3 Ürün)
            renderHero(allProducts.filter(p => p.p_pop === true).slice(0, 3));
            
            // 2. Arama Motorunu Bağla
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

// POPÜLER GÖRSEL GRID (SADECE GÖRSEL)
function renderHero(products) {
    const container = document.getElementById("popular-layout");
    if (!container || products.length < 3) return;

    container.innerHTML = `
        <div class="hero-item item-big">
            <img src="${products[0].p_url || products[0].p_img}" alt="Popüler 1">
        </div>
        <div class="hero-item">
            <img src="${products[1].p_url || products[1].p_img}" alt="Popüler 2">
        </div>
        <div class="hero-item">
            <img src="${products[2].p_url || products[2].p_img}" alt="Popüler 3">
        </div>
    `;
}

// HOVER İLE MARKA GÖSTERME
function showBrands(category) {
    const brands = [...new Set(allProducts.filter(p => p.p_cat === category).map(p => p.p_brand))];
    const dropdownId = category.includes("Plastik") ? "brands-Plastik" : 
                       category.includes("Promosyon") ? "brands-Promosyon" :
                       category.includes("Metal") ? "brands-Metal" : "brands-Diger";
    
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.innerHTML = brands.map(b => 
            `<a href="#" class="brand-link" onclick="filterByBrand('${b}', '${category}')">${b}</a>`
        ).join('');
    }
}

// ARAMA MOTORU (BUTON ÇALIŞIR HALE GELDİ)
function setupSearch() {
    const searchInput = document.getElementById("search");
    const searchBtn = document.getElementById("search-btn");

    const performSearch = () => {
        const term = searchInput.value.toLowerCase();
        const filtered = allProducts.filter(p => 
            p.p_name.toLowerCase().includes(term) || 
            p.p_brand.toLowerCase().includes(term)
        );
        renderGeneralList(filtered, term ? `"${term}" Sonuçları` : "Tüm Ürünler");
    };

    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => { if (e.key === 'Enter') performSearch(); });
}

function filterByBrand(brand, category) {
    const filtered = allProducts.filter(p => p.p_brand === brand && p.p_cat === category);
    renderGeneralList(filtered, `${category} > ${brand}`);
}

function filterByCategory(category) {
    const filtered = allProducts.filter(p => p.p_cat === category);
    renderGeneralList(filtered, category);
}

function renderGeneralList(products, title) {
    const container = document.querySelector(".popular-hero");
    container.innerHTML = `<h2 style="text-align:center; margin-bottom:30px;">${title}</h2>
                           <div class="general-grid" id="general-list"></div>`;
    
    const list = document.getElementById("general-list");
    list.style.display = "grid";
    list.style.gridTemplateColumns = "repeat(auto-fill, minmax(250px, 1fr))";
    list.style.gap = "25px";

    list.innerHTML = products.map(p => `
        <div class="product-card" style="border: 1px solid #eee; padding: 20px; border-radius: 15px; text-align: center; background:#fff;">
            <img src="${p.p_url || p.p_img}" style="width:100%; height:250px; object-fit:contain; margin-bottom:15px;">
            <small style="color:#999; text-transform:uppercase;">${p.p_brand}</small>
            <h4 style="margin:10px 0;">${p.p_name}</h4>
        </div>
    `).join('');
    window.scrollTo({ top: 400, behavior: 'smooth' });
}

// MODAL KONTROL
function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }