let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // ANA SAYFA KONTROLÜ
            if (document.getElementById("popular-layout")) {
                const populars = allProducts.filter(p => p.p_pop === true);
                
                // Ürünleri 3'erli gruplara ayır
                for (let i = 0; i < populars.length; i += 3) {
                    const chunk = populars.slice(i, i + 3);
                    if(chunk.length === 3) popularSets.push(chunk);
                }

                if (popularSets.length > 0) {
                    renderHero(popularSets[0]);
                    // Eğer birden fazla 3'lü set varsa slider'ı başlat (7 Saniye)
                    if (popularSets.length > 1) {
                        setInterval(nextSlide, 7000);
                    }
                }

                // Detay sayfasından arama yaparak dönüldüyse
                const urlParams = new URLSearchParams(window.location.search);
                const searchTerm = urlParams.get("search");
                if (searchTerm) {
                    document.getElementById("search").value = searchTerm;
                    performSearch();
                }
            }
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

function renderHero(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    
    // Asimetrik Grid: İlk ürün 'item-big' sınıfını alır
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}">
        </div>
    `).join('');
}

function nextSlide() {
    const grid = document.getElementById("popular-layout");
    if (!grid) return;

    // Yumuşak geçiş için önce opacity düşür
    grid.style.opacity = "0";
    
    setTimeout(() => {
        currentSetIndex = (currentSetIndex + 1) % popularSets.length;
        renderHero(popularSets[currentSetIndex]);
        // Yeni resimler yüklenince opacity geri getir
        grid.style.opacity = "1";
    }, 600); // CSS transition süresiyle uyumlu (0.5s + 0.1s buffer)
}

function showBrands(category) {
    const brands = [...new Set(allProducts.filter(p => p.p_cat === category).map(p => p.p_brand))];
    let id = category.includes("Plastik") ? "brands-Plastik" : 
             category.includes("Promosyon") ? "brands-Promosyon" : 
             category.includes("Metal") ? "brands-Metal" : "brands-Diger";
    
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
    const input = document.getElementById("search");
    if (!input) return;
    const term = input.value.toLowerCase();
    
    // Eğer detay sayfasındaysak index.html'e parametreyle gönder
    if (!document.getElementById("popular-hero-area")) {
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
        return;
    }
    
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
    area.innerHTML = `<h2 style="text-align:center; font-size: 22px; margin-bottom: 20px;">${title}</h2><div class="general-grid" id="general-list"></div>`;
    document.getElementById("general-list").innerHTML = products.map(p => `
        <div class="product-card" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}">
            <h4 style="font-size:15px; margin: 8px 0;">${p.p_name}</h4>
        </div>
    `).join('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
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