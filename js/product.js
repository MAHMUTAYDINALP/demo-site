let allProducts = [];
let popularSets = [];
let currentSetIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            allProducts = data.products || [];
            
            // Popüler ürünleri 3'erli gruplara ayır (Slider için)
            const populars = allProducts.filter(p => p.p_pop === true);
            for (let i = 0; i < populars.length; i += 3) {
                if(populars.slice(i, i + 3).length === 3) {
                    popularSets.push(populars.slice(i, i + 3));
                }
            }

            // İlk seti göster ve slider'ı başlat
            if (popularSets.length > 0) {
                renderHero(popularSets[0]);
                if (popularSets.length > 1) setInterval(nextSlide, 7000);
            }
            
            setupSearch();
        })
        .catch(err => console.error("Veri yüklenemedi:", err));
});

// Slider Fonksiyonu
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

function renderHero(products) {
    const container = document.getElementById("popular-layout");
    if (!container) return;
    container.innerHTML = `
        <div class="hero-item item-big" onclick="goToDetail('${products[0].p_name}')"><img src="${products[0].p_url || products[0].p_img}"></div>
        <div class="hero-item" onclick="goToDetail('${products[1].p_name}')"><img src="${products[1].p_url || products[1].p_img}"></div>
        <div class="hero-item" onclick="goToDetail('${products[2].p_name}')"><img src="${products[2].p_url || products[2].p_img}"></div>
    `;
}

// Marka Logolarını Gösteren Dropdown
function showBrands(category) {
    const brands = [...new Set(allProducts.filter(p => p.p_cat === category).map(p => p.p_brand))];
    let dropdownId = "";
    if (category.includes("Plastik")) dropdownId = "brands-Plastik";
    else if (category.includes("Promosyon")) dropdownId = "brands-Promosyon";
    else if (category.includes("Metal")) dropdownId = "brands-Metal";
    else dropdownId = "brands-Diger";

    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        // NOT: img/brands/ klasörüne 'Clipper.png', 'Tokai.png' gibi isimlerle logoları eklemelisin.
        dropdown.innerHTML = brands.map(b => `
            <a href="#" class="brand-img-link" onclick="filterByBrand('${b}', '${category}')" title="${b}">
                <img src="img/brands/${b}.png" alt="${b}" onerror="this.src='img/logo.png'">
            </a>
        `).join('');
    }
}

// Detay Sayfasına Yönlendirme
function goToDetail(name) {
    window.location.href = `detail.html?name=${encodeURIComponent(name)}`;
}

// Detay Sayfası Veri Yükleme
function loadProductDetail(name) {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            const product = data.products.find(p => p.p_name === name);
            if (product) {
                document.getElementById("detail-img").src = product.p_url || product.p_img;
                document.getElementById("detail-title").innerText = product.p_name;
                document.getElementById("detail-brand").innerText = product.p_brand;
                document.getElementById("detail-desc").innerText = product.p_desc || "Bu ürün için detaylı açıklama bulunmamaktadır.";
                
                // WhatsApp Linki (Kırgıl Çakmak Numarası)
                const waNumber = "905050696639";
                const message = `Merhaba, kataloğunuzdaki "${product.p_name}" ürünü hakkında bilgi alabilir miyim?`;
                document.getElementById("whatsapp-btn").href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
            }
        });
}

// Arama ve Diğer Listeleme Fonksiyonları (Öncekiyle aynı ancak onclick güncellendi)
function renderGeneralList(products, title) {
    document.getElementById("section-title").innerText = title;
    const containerArea = document.getElementById("popular-hero-area");
    containerArea.innerHTML = `<h2 id="section-title" style="font-size: 22px; text-align: center; margin-bottom: 20px;">${title}</h2><div class="general-grid" id="general-list"></div>`;
    const list = document.getElementById("general-list");
    list.innerHTML = products.map(p => `
        <div class="product-card" onclick="goToDetail('${p.p_name}')">
            <img src="${p.p_url || p.p_img}">
            <small style="color:#999; text-transform:uppercase; font-size:10px;">${p.p_brand}</small>
            <h4 style="margin:8px 0; font-size: 15px;">${p.p_name}</h4>
        </div>
    `).join('');
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

// Arama ve Filtreleme (PerformSearch vb.) önceki kodlardan devam eder...