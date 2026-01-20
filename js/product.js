let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;
let sliderInterval;
let isAnimating = false;

// Tıklama ve Kaydırma Kontrol Değişkenleri
let startX = 0;
let startTime = 0;
let isDragging = false;
const timeThreshold = 200; // 200ms'den uzun basışlar sürükleme sayılır
const moveThreshold = 5;   // 5px'den fazla hareket sürükleme sayılır

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            const popularLayout = document.getElementById("popular-layout");

            if (popularLayout) {
                const populars = allProducts.filter(p => p.p_pop === true);
                popularSets = [];
                for (let i = 0; i < populars.length; i += 3) {
                    const set = populars.slice(i, i + 3);
                    if(set.length === 3) popularSets.push(set);
                }

                if (popularSets.length > 0) {
                    renderHeroSet(popularSets[0]);
                    if (popularSets.length > 1) {
                        startAutoSlider();
                        initManualSwipe();
                    }
                }
            }
            setupSearch();
        });
});

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

function initManualSwipe() {
    const layout = document.getElementById("popular-layout");
    if (!layout) return;
    
    // MOUSE OLAYLARI
    layout.addEventListener('mousedown', (e) => {
        e.preventDefault();
        startX = e.pageX;
        startTime = Date.now(); // Basıldığı anı kaydet
        isDragging = false;
        clearInterval(sliderInterval);
    });

    // Hareket kontrolü: Çok az bile oynatsa sürükleme başlasın
    layout.addEventListener('mousemove', (e) => {
        if (startTime === 0) return;
        if (Math.abs(e.pageX - startX) > moveThreshold) {
            isDragging = true;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (startTime === 0) return;
        handleActionEnd(e.pageX, e.target);
        startTime = 0; // Sıfırla
    });

    // MOBİL (TOUCH) OLAYLARI
    layout.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        startTime = Date.now();
        isDragging = false;
        clearInterval(sliderInterval);
    });

    layout.addEventListener('touchend', (e) => {
        if (startTime === 0) return;
        handleActionEnd(e.changedTouches[0].pageX, e.target);
        startTime = 0;
    });
}

// ASIL KARAR MEKANİZMASI
function handleActionEnd(endX, targetElement) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const diff = startX - endX;
    const absDiff = Math.abs(diff);

    // KURAL 1: Süre çok kısaysa VE hareket çok azsa TIKLAMA say.
    // KURAL 2: Süre uzunsa VEYA hareket çoksa sürükleme (yönüne göre) veya iptal say.
    if (duration < timeThreshold && absDiff < moveThreshold) {
        const heroItem = targetElement.closest('.hero-item');
        if (heroItem) {
            const productName = heroItem.getAttribute('data-name');
            goToDetail(productName);
        }
    } else if (absDiff >= 50) {
        // 50px'den fazla kaydıysa seti değiştir
        moveSlider(diff > 0 ? 1 : -1);
    }
    
    startAutoSlider();
}

// DİĞER FONKSİYONLAR (Arama, Filtre vb. Değişmedi)
function performSearch() {
    const input = document.getElementById("search");
    if (!input) return;
    const term = input.value.toLowerCase();
    if (!document.getElementById("popular-hero-area")) {
        window.location.href = `index.html?search=${encodeURIComponent(term)}`;
        return;
    }
    renderGeneralList(allProducts.filter(p => p.p_name.toLowerCase().includes(term) || p.p_brand.toLowerCase().includes(term)), `"${term}" Sonuçları`);
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
function setupSearch() {
    const btn = document.getElementById("search-btn");
    const input = document.getElementById("search");
    if (btn) btn.onclick = performSearch;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
}