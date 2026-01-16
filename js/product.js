fetch('data/product.json')
 .then(res => res.json())
 .then(products => {
    const container= document.getElementById('product=list');
    
    products.forEach(p => {
        container.innerHTML += `
        <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>${p.description}</>
        <span>${p.category}</span>
        </div>

    `;
    });
 }); 