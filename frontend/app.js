const API_BASE = "http://localhost:8000";

const productRows = document.getElementById("product-rows");
const emptyState = document.getElementById("empty-state");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");

const dkk = new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
});

async function fetchProducts() {
    const category = categoryFilter.value;
    const [sort, direction] = sortSelect.value.split(":");
    const params = new URLSearchParams({ sort, direction });
    if (category) params.set("category", category);
    if (minPriceInput.value) params.set("min_price", minPriceInput.value);
    if (maxPriceInput.value) params.set("max_price", maxPriceInput.value);
    const res = await fetch(`${API_BASE}/products?${params.toString()}`);
    const products = await res.json();
    renderTable(products);
}

function renderTable(products) {
    if (products.length === 0) {
        productRows.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }
    emptyState.classList.add("hidden");
    productRows.innerHTML = products.map(p => `
        <tr data-id="${p.id}">
            <td class="name">${p.name}</td>
            <td class="num price">${dkk.format(p.price)}</td>
            <td class="num">${p.stock}</td>
            <td>${p.release_date}</td>
        </tr>
    `).join("");
    for (const tr of productRows.querySelectorAll("tr")) {
        tr.addEventListener("click", () => {
            window.location.href = `product.html?id=${tr.dataset.id}`;
        });
    }
}

async function fetchCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    const cats = await res.json();
    for (const c of cats) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        categoryFilter.appendChild(opt);
    }
}

categoryFilter.addEventListener("change", fetchProducts);
sortSelect.addEventListener("change", fetchProducts);
minPriceInput.addEventListener("change", fetchProducts);
maxPriceInput.addEventListener("change", fetchProducts);

fetchCategories().then(fetchProducts);
