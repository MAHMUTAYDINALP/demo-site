let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;
let sliderInterval;
let isAnimating = false;
let startX = 0;
let isDragging = false;

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            const popularLayout = document.getElementById("popular-layout");

            if (popularLayout) {
                const populars = allProducts.filter(p => p.p_pop === true);
                
                // POPÜLER SETLERİ OLUŞTUR
                popularSets = [];
                for (let i = 0; i < populars.length; i += 3) {
                    const set = populars.slice(i, i + 3);
                    if(set.length === 3) popularSets.push(set);
                }

                // DEBUG: Konsola bak, kaç set oluştuğunu gör
                console.log("Oluşan Popüler Set Sayısı:", popularSets.length);

                if (popularSets.length > 0) {
                    renderHeroSet(popularSets[0]); // İlk seti bas
                    
                    if (popularSets.length > 1) {
                        console.log("Slider Motoru Başlatıldı.");
                        startAutoSlider();
                        initManualSwipe();
                    }
                } else {
                    console.error("HATA: Popüler ürün sayısı 3'ten az olduğu için slider başlamadı!");
                }
            }
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

function renderHeroSet(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}">
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
        
        // YENİ GÖRSELİ OLUŞTUR VE HAZIRLA
        const nextImg = document.createElement('img');
        nextImg.src = nextSet[i].p_url || nextSet[i].p_img;
        nextImg.alt = nextSet[i].p_name;
        
        // Animasyon Sınıfları (CSS ile birebir aynı olmalı)
        nextImg.className = direction > 0 ? 'slide-left-in' : 'slide-right-in';
        item.appendChild(nextImg);

        if (currentImg) {
            currentImg.className = direction > 0 ? 'slide-left-out' : 'slide-right-out';
        }

        // Animasyon bitiminde temizlik
        setTimeout(() => {
            if (currentImg) currentImg.remove();
            nextImg.className = ''; 
            item.setAttribute('onclick', `goToDetail('${nextSet[i].p_name}')`);
            
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
    
    // MOUSE OLAYLARI
    layout.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        isDragging = true;
        clearInterval(sliderInterval);
    });

    // Mouse bırakıldığında veya alan dışına çıktığında
    window.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        handleSwipeEnd(e.pageX);
    });

    // DOKUNMATİK (MOBİL)
    layout.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        isDragging = true;
        clearInterval(sliderInterval);
    }, {passive: true});

    layout.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        handleSwipeEnd(e.changedTouches[0].pageX);
    }, {passive: true});
}

function handleSwipeEnd(endX) {
    isDragging = false;
    const diff = startX - endX;
    if (Math.abs(diff) > 50) {
        moveSlider(diff > 0 ? 1 : -1);
    }
    startAutoSlider();
}

// DİĞER FONKSİYONLAR
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
            <h4 style="font-size:14px; margin: 10px 0;">${p.p_name}</h4>
        </div>
    `).join('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
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