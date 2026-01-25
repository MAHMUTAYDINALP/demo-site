
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

// --- 1. TÜRKÇE KARAKTER VE TEMİZLİK FONKSİYONU ---
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

// --- 2. SİSTEM BAŞLATICI ---
document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || data || [];
            
            // VERİLER GELDİĞİ ANDA ÇALIŞACAK FONKSİYONLAR
            initTickers();
            loadBrandTicker(); // Marka kaydırıcıyı başlat
            loadMostLiked();   // EN ÖNEMLİSİ: Beğenilen ürünleri burada çağırıyoruz

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
                    const searchInput = document.getElementById("search");
                    if (searchInput) searchInput.value = searchParam;
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

// --- 3. ŞERİT (TICKER) ---
function initTickers() {
    const rightTicker = document.getElementById("ticker-right");
    const leftTicker = document.getElementById("ticker-left");
    if (!rightTicker || !leftTicker) return;

    const randomSet = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 12);
    const tickerContent = randomSet.map(p => `
        <div class="ticker-item" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_img}" loading="lazy" onerror="this.src='img/logo.png'">
        </div>
    `).join('') + randomSet.map(p => `
        <div class="ticker-item" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_img}" loading="lazy" onerror="this.src='img/logo.png'">
        </div>
    `).join('');

    rightTicker.innerHTML = tickerContent;
    leftTicker.innerHTML = tickerContent;
}

// --- 4. KATEGORİ FİLTRELEME ---
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

// --- 5. MARKA DROPDOWN ---
function showBrands(category) {
    const searchCatNormalized = normalizeText(category);
    // Sadece o kategoriye ait ürünleri filtrele
    const filteredProducts = allProducts.filter(p => {
        const productCatNormalized = normalizeText(p.p_cat);
        // Kategori isminin ilk kelimesine göre (Plastik, Metal vb.) eşleştirme yap
        return productCatNormalized.includes(searchCatNormalized.split(' ')[0]);
    });

    const brands = [...new Set(filteredProducts.map(p => p.p_brand))];

    // Doğru ID'ye sahip kutuyu seç (Hatanın kaynağı burasıydı)
    let id = "";
    if (searchCatNormalized.includes("plastik")) id = "brands-Plastik";
    else if (searchCatNormalized.includes("promosyon")) id = "brands-Promosyon";
    else if (searchCatNormalized.includes("metal")) id = "brands-Metal";
    else id = "brands-Diger";

    const dropdown = document.getElementById(id);
    if (dropdown) {
        dropdown.innerHTML = brands.map(b => {
            let fileName = normalizeText(b).replace(/\s+/g, '-');
            return `
                <a href="javascript:void(0)" class="brand-img-link" 
                   onclick="event.stopPropagation(); executeBrandSearch('${b}', '${category}')">
                    <img src="brands/${fileName}.png" loading="lazy" onerror="this.src='img/logo.png'">
                </a>
            `;
        }).join('');
    }
}

// --- 6. MARKA FİLTRELEME ---
function executeBrandSearch(brandName, categoryName) {
    const searchInput = document.getElementById("search");
    if (searchInput) searchInput.value = brandName;
    const sBrand = normalizeText(brandName);
    const sCat = normalizeText(categoryName);
    const filtered = allProducts.filter(p => {
        const pBrand = normalizeText(p.p_brand);
        const pCat = normalizeText(p.p_cat);
        const isBrandMatch = (pBrand === sBrand);
        const catFirstWord = sCat.split(' ')[0]; 
        const isCatMatch = pCat.includes(catFirstWord) || catFirstWord.includes(pCat);
        return isBrandMatch && isCatMatch;
    });
    renderGeneralList(filtered, `${categoryName} > ${brandName}`);
}

// --- 7. GENEL LİSTE OLUŞTURMA ---
function renderGeneralList(products, title) {
    const area = document.getElementById("popular-hero-area");
    if (!area) return;
    clearInterval(sliderInterval);
    area.innerHTML = `
        <h2 id="section-title" style="text-align:center; font-size: 20px; margin-bottom: 20px;">${title}</h2>
        <div class="general-grid" id="general-list"></div>
    `;
    const list = document.getElementById("general-list");
    if (products.length === 0) {
        list.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 50px;">Ürün bulunamadı.</p>`;
    } else {
        list.innerHTML = products.map(p => `
            <div class="product-card" onclick="goToDetail('${p.p_name}')">
                <img src="${p.p_img}" loading="lazy" draggable="false" onerror="this.src='img/logo.png'">
                <small style="color:#999; text-transform:uppercase; font-size:10px;">${p.p_brand}</small>
                <h4 style="margin:8px 0; font-size: 14px;">${p.p_name}</h4>
            </div>
        `).join('');
    }
    const header = document.querySelector('.header-wrapper');
    const headerHeight = header ? header.offsetHeight : 120;
    const targetPos = area.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
}

// --- 8. ARAMA FONKSİYONLARI ---
function performSearch() {
    const searchInput = document.getElementById("search");
    if (!searchInput) return;
    const term = normalizeText(searchInput.value);
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

function setupSearch() {
    const btn = document.getElementById("search-btn");
    const input = document.getElementById("search");
    if (btn) btn.onclick = performSearch;
    if (input) input.onkeypress = (e) => { if (e.key === 'Enter') performSearch(); };
}

// --- 9. SLIDER ---
function renderHeroSet(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = products.map((p, index) => `
        <div class="hero-item ${index === 0 ? 'item-big' : ''}" data-name="${p.p_name}">
            <img src="${p.p_img}" alt="${p.p_name}" draggable="false" loading="lazy" onerror="this.src='img/logo.png'">
        </div>
    `).join('');
}

function startAutoSlider() {
    clearInterval(sliderInterval);
    sliderInterval = setInterval(() => moveSlider(1), 7000);
}

// İkinci parametre olarak isManual ekledik
function moveSlider(direction, touchedItem = null) {
    if (isAnimating || popularSets.length < 2) return;
    isAnimating = true;

    const heroItems = document.querySelectorAll('.hero-item');
    const nextIndex = (currentSetIndex + direction + popularSets.length) % popularSets.length;
    const nextSet = popularSets[nextIndex];

    heroItems.forEach((item, i) => {
        // --- KRİTİK MANTIK BURADA ---
        // Eğer bir öğeye dokunulmuşsa (touchedItem varsa), sadece O ÖĞEYİ kaydır.
        // Eğer dokunulan bir öğe yoksa (otomatik kaymaysa), HEPSİNİ kaydır.
        const shouldAnimate = !touchedItem || item === touchedItem;

        if (shouldAnimate) {
            const currentImg = item.querySelector('img');
            const nextImg = document.createElement('img');
            nextImg.src = nextSet[i].p_img;
            
            // Yöne göre animasyon sınıfını ekle
            nextImg.className = direction > 0 ? 'slide-left-in' : 'slide-right-in';
            item.appendChild(nextImg);

            if (currentImg) {
                currentImg.className = direction > 0 ? 'slide-left-out' : 'slide-right-out';
            }

            setTimeout(() => {
                if (currentImg) currentImg.remove();
                nextImg.className = ''; 
                item.setAttribute('data-name', nextSet[i].p_name);
            }, 800);
        }
    });

    // Animasyon bitişini yönet
    setTimeout(() => {
        currentSetIndex = nextIndex;
        isAnimating = false;
    }, 850);
}

// --- 10. DETAY SAYFASI VE MODALLAR ---
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

    if (absDiff < 50 && duration < 250) {
        const heroItem = targetElement.closest('.hero-item');
        if (heroItem) goToDetail(heroItem.getAttribute('data-name'));
    } else if (absDiff >= 70) { 
        // Dokunulan öğeyi (hero-item) bul ve moveSlider'a gönder
        const touchedItem = targetElement.closest('.hero-item');
        moveSlider(diff > 0 ? 1 : -1, touchedItem); 
    }
    startAutoSlider();
}

function openContact() { document.getElementById("contact-modal").style.display = "block"; }
function closeContact() { document.getElementById("contact-modal").style.display = "none"; }

// --- 11. MARKA VE EN BEĞENİLENLER ---
function loadBrandTicker() {
    const brandTicker = document.getElementById('brand-logos-ticker');
    if (!brandTicker) return;

    const brands = [
        { name: 'alaska', img: 'brands/alaska.png' },
        { name: 'bk-jet', img: 'brands/bk-jet.png' },
        { name: 'campin', img: 'brands/campin.png' },
        { name: 'Clipper', img: 'brands/clipper.png' },
        { name: 'copper', img: 'brands/copper.png' },
        { name: 'diger', img: 'brands/diger.png' },
        { name: 'fer', img: 'brands/fer.png' },
        { name: 'golf', img: 'brands/golf.png' },
        { name: 'I-Lighter', img: 'brands/i-lighter.png' },
        { name: 'kasai', img: 'brands/kasai.png' },
        { name: 'mry', img: 'brands/mry.png' },
        { name: 'par', img: 'brands/par.png' },
        { name: 'silvio monetti', img: 'brands/silvio-monetti.png' },
        { name: 'str', img: 'brands/str.png' },
        { name: 'tokai', img: 'brands/tokai.png' },
        { name: 'zippo', img: 'brands/zippo.png' }
    ];

    const tripleBrands = [...brands, ...brands, ...brands];
    brandTicker.innerHTML = tripleBrands.map(brand => `
        <div class="ticker-item">
            <img src="${brand.img}" alt="${brand.name}" title="${brand.name}">
        </div>
    `).join('');
}

function loadMostLiked() {
    const targetImages = ["img/2.png", "img/10.png", "img/20.png", "img/23.png", "img/25.png", "img/35.png", "img/36.png", "img/37.png", "img/62.png", "img/79.png", "img/81.png", "img/83.png", "img/91.png", "img/146.png", "img/147.png"];
    
    const container = document.getElementById('most-liked-products');
    if (!container || allProducts.length === 0) return;

    const featured = allProducts.filter(product => targetImages.includes(product.p_img));
    featured.sort((a, b) => targetImages.indexOf(a.p_img) - targetImages.indexOf(b.p_img));

    container.innerHTML = featured.map(product => `
        <div class="product-card" onclick="goToDetail('${product.p_name}')">
            <img src="${product.p_img}" alt="${product.p_name}" loading="lazy">
            <p style="color: #e80000; font-weight: bold; font-size: 12px; margin: 5px 0; text-transform:uppercase;">${product.p_brand}</p>
            <h4 style="font-size: 14px; color: #444; margin: 0;">${product.p_name}</h4>
        </div>
    `).join('');
}

// Resim yolunu güvenli hale getiren fonksiyon
function getSecureImgPath(path) {
    if (!path) return "img/logo.png"; // Resim yoksa logo bas
    
    // Eğer yol zaten 'img/' ile başlıyorsa dokunma
    if (path.startsWith('img/')) return path;
    
    // Eğer başında '/' varsa (Örn: /28.png), slash'ı kaldır ve img/ ekle
    if (path.startsWith('/')) return 'img' + path;
    
    // Hiçbiri yoksa (Örn: 28.png), direkt img/ ekle
    return 'img/' + path;
}