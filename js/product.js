let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;
let sliderInterval;

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            if (document.getElementById("popular-layout")) {
                const populars = allProducts.filter(p => p.p_pop === true);
                for (let i = 0; i < populars.length; i += 3) {
                    if(populars.slice(i, i + 3).length === 3) popularSets.push(populars.slice(i, i + 3));
                }
                if (popularSets.length > 0) {
                    // İlk seti render et
                    renderHeroInitial(popularSets[0]);
                    // Birden fazla set varsa slider'ı başlat (7sn)
                    if (popularSets.length > 1) {
                        sliderInterval = setInterval(nextSlide, 7000);
                    }
                }

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

// SADECE İLK AÇILIŞTA HTML YAPISINI KURAR
function renderHeroInitial(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}" class="hero-img">
        </div>
    `).join('');
}

// YENİ SLIDER FONKSİYONU (KAYMA EFEKTİ)
function nextSlide() {
    const images = document.querySelectorAll('.hero-img');
    if (images.length === 0) return;

    // 1. Mevcut resimleri sola kaydırarak çıkar
    images.forEach(img => img.classList.add('slide-out'));

    // 2. Animasyon bitince (600ms sonra)
    setTimeout(() => {
        currentSetIndex = (currentSetIndex + 1) % popularSets.length;
        const nextProducts = popularSets[currentSetIndex];
        const heroItems = document.querySelectorAll('.hero-item');

        // 3. Görünmezken yeni resimleri yükle ve sağdan gelme sınıfını ekle
        heroItems.forEach((item, index) => {
            const img = item.querySelector('img');
            img.src = nextProducts[index].p_url || nextProducts[index].p_img;
            img.alt = nextProducts[index].p_name;
            item.setAttribute('onclick', `goToDetail('${nextProducts[index].p_name}')`);
            
            img.classList.remove('slide-out');
            img.classList.add('slide-in');
        });

        // 4. Sağdan gelme animasyonu bitince sınıfı temizle (bir sonraki tur için)
        setTimeout(() => {
            images.forEach(img => img.classList.remove('slide-in'));
        }, 600);

    }, 600); // CSS animasyon süresiyle eşleşmeli
}


// --- DİĞER FONKSİYONLAR (Aynı kaldı) ---
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
            <small style="color:#999; text-transform:uppercase; font-size:10px;">${p.p_brand}</small>
            <h4 style="margin:8px 0; font-size: 15px;">${p.p_name}</h4>
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