let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;
let sliderInterval;
let isAnimating = false;

let startX = 0;
let startTime = 0;
let isDragging = false;
const timeThreshold = 200; 
const moveThreshold = 5; 

function normalizeText(text) {
    if (!text) return "";
    return text.toString()
        .replace(/İ/g, 'i').replace(/I/g, 'i')
        .replace(/ı/g, 'i').replace(/i/g, 'i')
        .replace(/Ğ/g, 'g').replace(/ğ/g, 'g')
        .replace(/Ü/g, 'u').replace(/ü/g, 'u')
        .replace(/Ş/g, 's').replace(/ş/g, 's')
        .replace(/Ö/g, 'o').replace(/ö/g, 'o')
        .replace(/Ç/g, 'c').replace(/ç/g, 'c')
        .toLowerCase().trim();
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || data || [];
            
            // Şeritleri (Ticker) Başlat
            initTickers();

            const urlParams = new URLSearchParams(window.location.search);
            const catParam = urlParams.get("cat");
            const searchParam = urlParams.get("search");
            const popularLayout = document.getElementById("popular-layout");

            if (popularLayout) {
                const populars = allProducts.filter(p => p.p_pop === true);
                popularSets = [];
                for (let i = 0; i < populars.length; i += 3) {
                    const set = populars.slice(i, i + 3);
                    if(set.length === 3) popularSets.push(set);
                }

                if (catParam) {
                    filterByCategory(catParam);
                } else if (searchParam) {
                    document.getElementById("search").value = searchParam;
                    performSearch();
                } else if (popularSets.length > 0) {
                    renderHeroSet(popularSets[0]);
                    if (popularSets.length > 1) {
                        startAutoSlider();
                        initManualSwipe();
                    }
                }
            }
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

// --- YENİ: HAREKETLİ ŞERİT MANTIĞI ---
function initTickers() {
    const rightTicker = document.getElementById("ticker-right");
    const leftTicker = document.getElementById("ticker-left");
    if (!rightTicker || !leftTicker) return;

    // Tüm ürünlerden rastgele 12 tane seç
    const randomSet = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 12);
    
    // Sonsuz döngü için ürünleri ikişer kez ekliyoruz (Marquee mantığı)
    const tickerContent = randomSet.map(p => `
        <div class="ticker-item" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_img}" onerror="this.src='img/logo.png'">
        </div>
    `).join('') + randomSet.map(p => `
        <div class="ticker-item" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_img}" onerror="this.src='img/logo.png'">
        </div>
    `).join('');

    rightTicker.innerHTML = tickerContent;
    leftTicker.innerHTML = tickerContent;
}

function filterByCategory(cat) {
    const area = document.getElementById("popular-hero-area");
    if (!area) {
        window.location.href = `index.html?cat=${encodeURIComponent(cat)}`;
        return;
    }
    const searchCatNormalized = normalizeText(cat);
    const filtered = allProducts.filter(p => {
        const productCatNormalized = normalizeText(p.p_cat);
        return searchCatNormalized.includes(productCatNormalized) || productCatNormalized.includes(searchCatNormalized.split(' ')[0]);
    });
    renderGeneralList(filtered, cat);
}
// --- MARKA FİLTRELEME FONKSİYONU (KESİN ÇÖZÜM) ---
function filterByBrand(brand, categoryTitle) {
    const area = document.getElementById("popular-hero-area");
    if (!area) {
        window.location.href = `index.html?search=${encodeURIComponent(brand)}`;
        return;
    }

    const searchBrand = normalizeText(brand);
    const searchCat = normalizeText(categoryTitle);

    // Listeyi hem marka hem kategori uyuşmasına göre filtrele
    const filtered = allProducts.filter(p => {
        const productBrand = normalizeText(p.p_brand);
        const productCat = normalizeText(p.p_cat);

        const isBrandMatch = productBrand === searchBrand;
        // Kategori ismi JSON'daki p_cat ile veya buton metni ile eşleşmeli
        const isCatMatch = searchCat.includes(productCat) || productCat.includes(searchCat.split(' ')[0]);
        
        return isBrandMatch && isCatMatch;
    });

    renderGeneralList(filtered, `${categoryTitle} > ${brand}`);
}


function renderGeneralList(products, title) {
    const area = document.getElementById("popular-hero-area");
    if (!area) return;
    clearInterval(sliderInterval);
    area.innerHTML = `
        <h2 id="section-title" style="text-align:center; font-size: 20px; margin-bottom: 20px;">${title}</h2>
        <div class="general-grid" id="general-list"></div>
    `;
    const list = document.getElementById("general-list");
    list.innerHTML = products.map(p => `
        <div class="product-card" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_img}" draggable="false" onerror="this.src='img/logo.png'">
            <small style="color:#999; text-transform:uppercase; font-size:10px;">${p.p_brand}</small>
            <h4 style="margin:8px 0; font-size: 14px;">${p.p_name}</h4>
        </div>
    `).join('');
    const header = document.querySelector('.header-wrapper');
    const headerHeight = header ? header.offsetHeight : 120;
    const targetPos = area.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
}

function showBrands(category) {
    const searchCat = normalizeText(category);
    const filteredProducts = allProducts.filter(p => {
        const productCat = normalizeText(p.p_cat);
        return searchCat.includes(productCat) || productCat.includes(searchCat.split(' ')[0]);
    });
    const brands = [...new Set(filteredProducts.map(p => p.p_brand))];
    let id = "";
    if (searchCat.includes("plastik")) id = "brands-Plastik";
    else if (searchCat.includes("promosyon")) id = "brands-Promosyon";
    else if (searchCat.includes("metal")) id = "brands-Metal";
    else id = "brands-Diger";
    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.innerHTML = brands.map(b => `
            <a href="#" class="brand-img-link" onclick="filterByBrand('${b}', '${category}')" title="${b}">
                <img src="brands/${b}.png" onerror="this.src='img/logo.png'">
            </a>
        `).join('');
    }
}

function renderHeroSet(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" data-name="${p.p_name}">
            <img src="${p.p_img}" alt="${p.p_name}" draggable="false" onerror="this.src='img/logo.png'">
        </div>
    `).join('');
}

function startAutoSlider() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => moveSlider(1), 7000);
}

function moveSlider(direction) {
    if (isAnimating || popularSets.length < 2) return;
    isAnimating = true;
    const heroItems = document.querySelectorAll('.hero-item');
    const nextIndex = (currentSetIndex + direction + popularSets.length) % popularSets.length;
    const nextSet = popularSets[nextIndex];
    heroItems.forEach((item, i) => {
        const currentImg = item.querySelector('img');
        const nextImg = document.createElement('img');
        nextImg.src = nextSet[i].p_img;
        nextImg.className = direction > 0 ? 'slide-left-in' : 'slide-right-in';
        item.appendChild(nextImg);
        if (currentImg) currentImg.className = direction > 0 ? 'slide-left-out' : 'slide-right-out';
        setTimeout(() => {
            if (currentImg) currentImg.remove();
            nextImg.className = ''; 
            item.setAttribute('data-name', nextSet[i].p_name);
            if (i === heroItems.length - 1) {
                currentSetIndex = nextIndex;
                isAnimating = false;
            }
        }, 700);
    });
}

function initManualSwipe() {
    const layout = document.getElementById("popular-layout");
    if (!layout) return;
    layout.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.pageX;
        startTime = Date.now();
        isDragging = false;
        clearInterval(sliderInterval);
    });
    layout.addEventListener('mousemove', (e) => {
        if (startTime === 0) return;
        if (Math.abs(e.pageX - startX) > moveThreshold) isDragging = true;
    });
    window.addEventListener('mouseup', (e) => {
        if (startTime === 0) return;
        handleActionEnd(e.pageX, e.target);
        startTime = 0;
    });
}

function handleActionEnd(endX, targetElement) {
    const duration = Date.now() - startTime;
    const diff = startX - endX;
    const absDiff = Math.abs(diff);
    if (duration < timeThreshold && absDiff < moveThreshold) {
        const heroItem = targetElement.closest('.hero-item');
        if (heroItem) goToDetail(heroItem.getAttribute('data-name'));
    } else if (absDiff >= 50) {
        moveSlider(diff > 0 ? 1 : -1);
    }
    startAutoSlider();
}

function setupSearch() {
    const btn = document.getElementById("search-btn");
    const input = document.getElementById("search");
    if (btn) btn.onclick = performSearch;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
}

function performSearch() {
    const term = normalizeText(document.getElementById("search").value);
    if (!term) return;
    const area = document.getElementById("popular-hero-area");
    if (!area) {
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
        return;
    }
    const filtered = allProducts.filter(p => 
        normalizeText(p.p_name).includes(term) || 
        normalizeText(p.p_brand).includes(term)
    );
    renderGeneralList(filtered, `"${term}" Sonuçları`);
}

function goToDetail(name) { window.location.href = `detail.html?name=${encodeURIComponent(name)}`; }

function loadProductDetail(name) {
    fetch("data/product.json").then(res => res.json()).then(data => {
        const list = data.products || data || []; 
        const p = list.find(x => normalizeText(x.p_name) === normalizeText(name));
        if (p) {
            document.getElementById("detail-img").src = p.p_img;
            document.getElementById("detail-title").innerText = p.p_name;
            document.getElementById("detail-brand").innerText = p.p_brand;
            document.getElementById("detail-desc").innerText = p.p_desc || "Detaylar için WhatsApp'tan ulaşın.";
            document.getElementById("whatsapp-btn").href = `https://wa.me/905050696639?text=${encodeURIComponent(p.p_name + ' hakkında bilgi alabilir miyim?')}`;
        }
    });
}

function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }