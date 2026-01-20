let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;
let sliderInterval;
let isAnimating = false;

// Tıklama ve Kaydırma Kontrol Değişkenleri
let startX = 0;
let startTime = 0;
let isDragging = false;
const timeThreshold = 200; 
const moveThreshold = 5;   

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // 1. URL Parametrelerini Kontrol Et
            const urlParams = new URLSearchParams(window.location.search);
            const catParam = urlParams.get("cat");
            const searchParam = urlParams.get("search");

            // 2. Sayfada "popular-layout" var mı? (Yani index.html'de miyiz?)
            const popularLayout = document.getElementById("popular-layout");

            if (popularLayout) {
                // Popüler setleri hazırla (Slider için)
                const populars = allProducts.filter(p => p.p_pop === true);
                popularSets = [];
                for (let i = 0; i < populars.length; i += 3) {
                    const set = populars.slice(i, i + 3);
                    if(set.length === 3) popularSets.push(set);
                }

                // EĞER URL'DE PARAMETRE VARSA DOĞRUDAN FİLTRELE
                if (catParam) {
                    filterByCategory(catParam);
                } else if (searchParam) {
                    document.getElementById("search").value = searchParam;
                    performSearch();
                } else if (popularSets.length > 0) {
                    // Normal açılışta ilk seti bas ve slider başlat
                    renderHeroSet(popularSets[0]);
                    if (popularSets.length > 1) {
                        startAutoSlider();
                        initManualSwipe();
                    }
                }
            } else {
                // Detay sayfasındaysak (detail.html)
                // Mevcut loadProductDetail fonksiyonu burada çalışmaya devam eder
            }
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

// --- KRİTİK LİSTELEME FONKSİYONLARI ---

function filterByCategory(cat) {
    const area = document.getElementById("popular-hero-area");
    // Eğer index.html'de değilsek (detay sayfasındaysak), parametreyle ana sayfaya git
    if (!area) {
        window.location.href = `index.html?cat=${encodeURIComponent(cat)}`;
        return;
    }
    const filtered = allProducts.filter(p => p.p_cat === cat);
    renderGeneralList(filtered, cat);
}

function filterByBrand(brand, cat) {
    const area = document.getElementById("popular-hero-area");
    if (!area) {
        window.location.href = `index.html?search=${encodeURIComponent(brand)}`;
        return;
    }
    const filtered = allProducts.filter(p => p.p_brand === brand && p.p_cat === cat);
    renderGeneralList(filtered, `${cat} > ${brand}`);
}

function renderGeneralList(products, title) {
    const area = document.getElementById("popular-hero-area");
    if (!area) return;
    
    // Slider'ı durdur
    clearInterval(sliderInterval);
    
    // ALANI TEMİZLE VE LİSTEYİ BAS
    area.innerHTML = `
        <h2 id="section-title" style="text-align:center; font-size: 20px; margin-bottom: 20px;">${title}</h2>
        <div class="general-grid" id="general-list"></div>
    `;
    
    const list = document.getElementById("general-list");
    list.innerHTML = products.map(p => `
        <div class="product-card" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}" draggable="false">
            <small style="color:#999; text-transform:uppercase; font-size:10px;">${p.p_brand}</small>
            <h4 style="margin:8px 0; font-size: 14px;">${p.p_name}</h4>
        </div>
    `).join('');
    
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// --- SLIDER FONKSİYONLARI (KAYDIRMA KORUNDU) ---

function renderHeroSet(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" data-name="${p.p_name}">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}" draggable="false">
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
        nextImg.src = nextSet[i].p_url || nextSet[i].p_img;
        nextImg.setAttribute('draggable', 'false');
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

// --- EVENT HANDLERS (CLICK & DRAG AYRIMI) ---

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

// --- DİĞER TEMEL FONKSİYONLAR ---

function setupSearch() {
    const btn = document.getElementById("search-btn");
    const input = document.getElementById("search");
    if (btn) btn.onclick = performSearch;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
}

function performSearch() {
    const term = document.getElementById("search").value.toLowerCase();
    if (!term) return;
    const area = document.getElementById("popular-hero-area");
    if (!area) {
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
        return;
    }
    const filtered = allProducts.filter(p => p.p_name.toLowerCase().includes(term) || p.p_brand.toLowerCase().includes(term));
    renderGeneralList(filtered, `"${term}" Sonuçları`);
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
            document.getElementById("detail-desc").innerText = p.p_desc || "Detaylar için WhatsApp'tan ulaşın.";
            document.getElementById("whatsapp-btn").href = `https://wa.me/905050696639?text=${encodeURIComponent(p.p_name + ' hakkında bilgi alabilir miyim?')}`;
        }
    });
}

function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }