let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            renderHero(allProducts.filter(p => p.p_pop === true).slice(0, 3));
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

function renderHero(products) {
    const container = document.getElementById("popular-layout");
    if (!container || products.length < 3) return;
    container.innerHTML = `
        <div class="hero-item item-big"><img src="${products[0].p_url || products[0].p_img}" alt="Popüler 1"></div>
        <div class="hero-item"><img src="${products[1].p_url || products[1].p_img}" alt="Popüler 2"></div>
        <div class="hero-item"><img src="${products[2].p_url || products[2].p_img}" alt="Popüler 3"></div>
    `;
}

function showBrands(category) {
    const brands = [...new Set(allProducts.filter(p => p.p_cat === category).map(p => p.p_brand))];
    let dropdownId = "";
    if (category.includes("Plastik")) dropdownId = "brands-Plastik";
    else if (category.includes("Promosyon")) dropdownId = "brands-Promosyon";
    else if (category.includes("Metal")) dropdownId = "brands-Metal";
    else dropdownId = "brands-Diger";

    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.innerHTML = brands.map(b => 
            `<a href="#" class="brand-link" onclick="filterByBrand('${b}', '${category}')">${b}</a>`
        ).join('');
    }
}

function setupSearch() {
    const searchInput = document.getElementById("search");
    const searchBtn = document.getElementById("search-btn");
    const performSearch = () => {
        const term = searchInput.value.toLowerCase();
        if (!term) return;
        const filtered = allProducts.filter(p => p.p_name.toLowerCase().includes(term) || p.p_brand.toLowerCase().includes(term));
        renderGeneralList(filtered, `"${term}" için Sonuçlar`);
    };
    searchBtn.addEventListener("click", performSearch);
    searchInput.addEventListener("keypress", (e) => { if (e.key === 'Enter') performSearch(); });
}

function filterByBrand(brand, category) {
    renderGeneralList(allProducts.filter(p => p.p_brand === brand && p.p_cat === category), `${category} > ${brand}`);
}

function filterByCategory(category) {
    renderGeneralList(allProducts.filter(p => p.p_cat === category), category);
}

function renderGeneralList(products, title) {
    document.getElementById("section-title").innerText = title;
    const containerArea = document.getElementById("popular-hero-area");
    containerArea.innerHTML = `<h2 id="section-title" style="font-size: 22px; text-align: center; margin-bottom: 20px;">${title}</h2><div class="general-grid" id="general-list"></div>`;
    
    const list = document.getElementById("general-list");
    list.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.p_url || p.p_img}">
            <small style="color:#999; text-transform:uppercase; font-size:10px;">${p.p_brand}</small>
            <h4 style="margin:8px 0; font-size: 15px;">${p.p_name}</h4>
        </div>
    `).join('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }