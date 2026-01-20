let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // Eğer ana sayfadaysak slider'ı ve aramayı başlat
            if (document.getElementById("popular-layout")) {
                const populars = allProducts.filter(p => p.p_pop === true);
                for (let i = 0; i < populars.length; i += 3) {
                    if(populars.slice(i, i + 3).length === 3) popularSets.push(populars.slice(i, i + 3));
                }
                if (popularSets.length > 0) {
                    renderHero(popularSets[0]);
                    if (popularSets.length > 1) setInterval(nextSlide, 7000);
                }

                // URL'den gelen bir arama parametresi var mı? (Detaydan dönünce lazım)
                const urlParams = new URLSearchParams(window.location.search);
                const searchTerm = urlParams.get("search");
                if (searchTerm) {
                    document.getElementById("search").value = searchTerm;
                    performSearch();
                }
            }
            setupSearch();
        });
});

function renderHero(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map(p => `
        <div class="hero-item ${products.indexOf(p) === 0 ? 'item-big' : ''}" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}">
        </div>
    `).join('');
}

function nextSlide() {
    const grid = document.getElementById("popular-layout");
    if (!grid) return;
    grid.style.opacity = "0";
    setTimeout(() => {
        currentSetIndex = (currentSetIndex + 1) % popularSets.length;
        renderHero(popularSets[currentSetIndex]);
        grid.style.opacity = "1";
    }, 500);
}

function showBrands(category) {
    const brands = [...new Set(allProducts.filter(p => p.p_cat === category).map(p => p.p_brand))];
    let id = category.includes("Plastik") ? "brands-Plastik" : category.includes("Promosyon") ? "brands-Promosyon" : category.includes("Metal") ? "brands-Metal" : "brands-Diger";
    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.innerHTML = brands.map(b => `
            <a href="#" class="brand-img-link" onclick="filterByBrand('${b}', '${category}')">
                <img src="img/brands/${b}.png" onerror="this.src='img/logo.png'">
            </a>
        `).join('');
    }
}

function setupSearch() {
    const btn = document.getElementById("search-btn");
    const input = document.getElementById("search");
    if (btn) btn.onclick = performSearch;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
}

function performSearch() {
    const term = document.getElementById("search").value.toLowerCase();
    if (!term) return;
    const filtered = allProducts.filter(p => p.p_name.toLowerCase().includes(term) || p.p_brand.toLowerCase().includes(term));
    renderGeneralList(filtered, `"${term}" Sonuçları`);
}

function filterByCategory(cat) {
    if (!document.getElementById("popular-hero-area")) {
        window.location.href = `index.html?cat=${encodeURIComponent(cat)}`;
        return;
    }
    renderGeneralList(allProducts.filter(p => p.p_cat === cat), cat);
}

function filterByBrand(brand, cat) {
    renderGeneralList(allProducts.filter(p => p.p_brand === brand && p.p_cat === cat), `${cat} > ${brand}`);
}

function renderGeneralList(products, title) {
    const area = document.getElementById("popular-hero-area");
    if (!area) return;
    area.innerHTML = `<h2 style="text-align:center;">${title}</h2><div class="general-grid" id="general-list"></div>`;
    document.getElementById("general-list").innerHTML = products.map(p => `
        <div class="product-card" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}">
            <h4 style="font-size:14px;">${p.p_name}</h4>
        </div>
    `).join('');
}

function goToDetail(name) { window.location.href = `detail.html?name=${encodeURIComponent(name)}`; }

function loadProductDetail(name) {
    fetch("data/product.json").then(res => res.json()).then(data => {
        const p = data.products.find(x => x.p_name === name);
        if (p) {
            document.getElementById("detail-img").src = p.p_url || p.p_img;
            document.getElementById("detail-title").innerText = p.p_name;
            document.getElementById("detail-brand").innerText = p.p_brand;
            document.getElementById("detail-desc").innerText = p.p_desc || "Detaylar için WhatsApp'tan ulaşın.";
            document.getElementById("whatsapp-btn").href = `https://wa.me/905050696639?text=${encodeURIComponent(p.p_name + ' hakkında bilgi alabilir miyim?')}`;
        }
    });
}

function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }