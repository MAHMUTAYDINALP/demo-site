let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;
let sliderInterval;
let isAnimating = false;

// Manuel Kaydırma Değişkenleri
let startX = 0;
let isDragging = false;

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            if (document.getElementById("popular-layout")) {
                const populars = allProducts.filter(p => p.p_pop === true);
                for (let i = 0; i < populars.length; i += 3) {
                    const set = populars.slice(i, i + 3);
                    if(set.length === 3) popularSets.push(set);
                }
                if (popularSets.length > 0) {
                    renderHeroSet(popularSets[0]);
                    startAutoSlider();
                    initManualSwipe();
                }
            }
            setupSearch();
        });
});

function startAutoSlider() {
    if (popularSets.length > 1) {
        clearInterval(sliderInterval);
        sliderInterval = setInterval(() => moveSlider(1), 7000);
    }
}

// Ana Kaydırma Fonksiyonu (Yön: 1 İleri, -1 Geri)
function moveSlider(direction) {
    if (isAnimating || popularSets.length < 2) return;
    isAnimating = true;

    const heroItems = document.querySelectorAll('.hero-item');
    const nextIndex = (currentSetIndex + direction + popularSets.length) % popularSets.length;
    const nextSet = popularSets[nextIndex];

    heroItems.forEach((item, i) => {
        // Mevcut resmi hazırla
        const currentImg = item.querySelector('img');
        
        // Yeni resmi oluştur ve arkaya/yana koy
        const nextImg = document.createElement('img');
        nextImg.src = nextSet[i].p_url || nextSet[i].p_img;
        nextImg.className = direction > 0 ? 'slide-left-in' : 'slide-right-in';
        item.appendChild(nextImg);

        // Mevcut resme çıkış animasyonu ver
        currentImg.className = direction > 0 ? 'slide-left-out' : 'slide-right-out';

        // Animasyon bitince temizlik yap
        setTimeout(() => {
            currentImg.remove();
            nextImg.className = ''; // Sınıfı temizle (statik hale getir)
            if (i === heroItems.length - 1) {
                currentSetIndex = nextIndex;
                isAnimating = false;
            }
        }, 700);
    });
}

// Manuel Kaydırma (Swipe) Başlatıcı
function initManualSwipe() {
    const layout = document.getElementById("popular-layout");
    
    // Mouse Olayları
    layout.onmousedown = (e) => { startX = e.pageX; isDragging = true; clearInterval(sliderInterval); };
    layout.onmouseup = (e) => { handleSwipeEnd(e.pageX); };
    
    // Dokunmatik Olaylar
    layout.ontouchstart = (e) => { startX = e.touches[0].pageX; isDragging = true; clearInterval(sliderInterval); };
    layout.ontouchend = (e) => { handleSwipeEnd(e.changedTouches[0].pageX); };
}

function handleSwipeEnd(endX) {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) { // 50px'den fazla kaydıysa değiştir
        moveSlider(diff > 0 ? 1 : -1);
    }
    startAutoSlider(); // Kaydırma bittikten sonra otomatiği geri başlat
}

function renderHeroSet(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}">
        </div>
    `).join('');
}

// --- DİĞER FONKSİYONLAR (Arama, Filtreleme vb. Değişmedi) ---
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
    renderGeneralList(allProducts.filter(p => p.p_name.toLowerCase().includes(term) || p.p_brand.toLowerCase().includes(term)), `"${term}" Sonuçları`);
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
    window.scrollTo({ top: 400, behavior: 'smooth' });
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

function goToDetail(name) { window.location.href = `detail.html?name=${encodeURIComponent(name)}`; }

function loadProductDetail(name) {
    fetch("data/product.json").then(res => res.json()).then(data => {
        const p = data.products.find(x => x.p_name === name);
        if (p) {
            document.getElementById("detail-img").src = p.p_url || p.p_img;
            document.getElementById("detail-title").innerText = p.p_name;
            document.getElementById("detail-brand").innerText = p.p_brand;
            document.getElementById("detail-desc").innerText = p.p_desc || "WhatsApp'tan ulaşın.";
            document.getElementById("whatsapp-btn").href = `https://wa.me/905050696639?text=${encodeURIComponent(p.p_name + ' hakkında bilgi alabilir miyim?')}`;
        }
    });
}

function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }