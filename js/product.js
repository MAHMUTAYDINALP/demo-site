// Global Değişkenler
let allProducts = [];
let selectedCategory = "";

document.addEventListener("DOMContentLoaded", () => {
    fetch("data/product.json")
        .then(res => res.json())
        .then(data => {
            // Veriyi al ve yedekle
            allProducts = data.products || [];
            
            // Başlangıçta popüler olanları göster
            const populars = allProducts.filter(p => p.p_pop === true);
            renderProducts(populars);
            
            // Arama motorunu başlat
            setupSearch();
        })
        .catch(err => console.error("Ürünler yüklenirken hata oluştu:", err));
});

// Ürünleri Ekrana Basan Ana Fonksiyon
function renderProducts(products) {
    const container = document.getElementById("popular-products");
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = "<div style='grid-column: 1/-1; padding: 50px; color: #999;'>Ürün bulunamadı.</div>";
        return;
    }

    container.innerHTML = products.map(p => `
        <div class="product-card" onclick="window.location.href='#product-detail'">
            <img src="${p.p_url || p.p_img}" alt="${p.p_name}">
            <div class="p-info">
                <small>${p.p_brand}</small>
                <h3>${p.p_name}</h3>
                <span style="font-size: 13px; color: #d32f2f; font-weight: bold;">${p.p_cat}</span>
            </div>
        </div>
    `).join('');
}

// Kategori Seçimi ve Marka Paneli Toggle Mantığı
function showBrands(category) {
    const panel = document.getElementById("brand-panel");
    const title = document.getElementById("section-title");

    // Eğer zaten o kategorideysek ve panel açıksa kapat (Toggle)
    if (selectedCategory === category && panel.style.display === "flex") {
        closeBrands();
        return;
    }

    // Seçimi güncelle ve paneli aç
    selectedCategory = category;
    panel.style.display = "flex";
    title.innerText = category;

    // Seçilen kategoriye ait ürünleri hemen listele
    const filtered = allProducts.filter(p => p.p_cat === category);
    renderProducts(filtered);

    // Ürünlerin olduğu bölüme yumuşak kaydır
    window.scrollTo({ top: 350, behavior: 'smooth' });
}

function closeBrands() {
    document.getElementById("brand-panel").style.display = "none";
    // Opsiyonel: Kapatınca tekrar popülerleri gösterir
    // renderProducts(allProducts.filter(p => p.p_pop));
}

// Marka Filtreleme
function filterByBrand(brand) {
    const filtered = allProducts.filter(p => p.p_brand === brand && p.p_cat === selectedCategory);
    document.getElementById("section-title").innerText = `${selectedCategory} > ${brand}`;
    renderProducts(filtered);
    closeBrands();
}

// Arama Motoru Fonksiyonu
function setupSearch() {
    const searchInput = document.getElementById("search");
    searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        
        const filtered = allProducts.filter(p => 
            p.p_name.toLowerCase().includes(term) || 
            p.p_brand.toLowerCase().includes(term) ||
            p.p_cat.toLowerCase().includes(term)
        );
        
        document.getElementById("section-title").innerText = term ? `"${term}" için Sonuçlar` : "Popüler Modellerimiz";
        renderProducts(term ? filtered : allProducts.filter(p => p.p_pop));
    });
}