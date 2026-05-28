const API_BASE = "http://localhost:8000";

// --- 1. DOM Element Selectors ---
const productRows = document.getElementById("product-rows");
const emptyState = document.getElementById("empty-state");
const categoryFilter = document.getElementById("category-filter");
const sortSelect = document.getElementById("sort-select");
const minPriceInput = document.getElementById("min-price");
const maxPriceInput = document.getElementById("max-price");
const totalCountSpan = document.getElementById("total-products-count");
const productTable = document.getElementById("product-table");

// --- 2. Currency Formatter (DKK) ---
const dkkFormatter = new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
});

// --- 3. API Data Fetching Functions ---

/**
 * Builds the shared URLSearchParams for filtering based on current inputs.
 */
function getFilterParams() {
    const params = new URLSearchParams();
    if (categoryFilter.value) params.set("category", categoryFilter.value);
    if (minPriceInput.value) params.set("min_price", minPriceInput.value);
    if (maxPriceInput.value) params.set("max_price", maxPriceInput.value);
    return params;
}

/**
 * Fetches and updates the total count of products matching the current filters.
 */
async function updateProductCount(params) {
    try {
        const res = await fetch(`${API_BASE}/products/count?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch count");
        const data = await res.json();
        if (totalCountSpan) totalCountSpan.textContent = data.total;
    } catch (error) {
        console.error("Error fetching product count:", error);
        if (totalCountSpan) totalCountSpan.textContent = "-";
    }
}

/**
 * Fetches products from the backend and triggers the table rendering.
 * Runs the count, stats, and data fetch requests in parallel for better performance.
 */
async function fetchAndRenderProducts() {
    const params = getFilterParams();

    // Extract and append sort parameters for the main product list query
    const [sort, direction] = sortSelect.value.split(":");
    params.set("sort", sort);
    params.set("direction", direction);

    try {
        // Run all async operations concurrently
        const [productsRes] = await Promise.all([
            fetch(`${API_BASE}/products?${params.toString()}`),
            updateProductCount(getFilterParams()),
            fetchAveragePrice(),
            fetchMostExpensive(),
        ]);

        const products = await productsRes.json();
        renderTable(products);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

/**
 * Fetches the available product categories and populates the select dropdown.
 */
async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();

        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat.id;
            opt.textContent = cat.name;
            categoryFilter.appendChild(opt);
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

/**
 * Fetches average price for current category filter and displays it above the table.
 */
async function fetchAveragePrice() {
    try {
        const category = categoryFilter.value;
        const params = category ? `?category=${category}` : "";
        const res = await fetch(`${API_BASE}/products/stats/average-price${params}`);
        const data = await res.json();
        let el = document.getElementById("avg-price-display");
        if (!el) {
            el = document.createElement("p");
            el.id = "avg-price-display";
            el.style.cssText = "text-align:right; color:#555; font-size:0.9rem; margin-bottom:0.5rem;";
            document.querySelector(".table-wrap").before(el);
        }
        el.textContent = data.count === 0
            ? ""
            : `Average price: ${dkkFormatter.format(data.avg_price)}`;
    } catch (error) {
        console.error("Error fetching average price:", error);
    }
}

/**
 * Fetches the most expensive product for current category filter and displays it above the table.
 */
async function fetchMostExpensive() {
    try {
        const category = categoryFilter.value;
        const params = category ? `?category=${category}` : "";
        const res = await fetch(`${API_BASE}/products/stats/most-expensive${params}`);
        const data = await res.json();
        let el = document.getElementById("most-expensive-display");
        if (!el) {
            el = document.createElement("p");
            el.id = "most-expensive-display";
            el.style.cssText = "text-align:right; color:#555; font-size:0.9rem; margin-bottom:0.5rem;";
            document.querySelector(".table-wrap").before(el);
        }
        el.textContent = data
            ? `Most expensive: ${data.name} — ${dkkFormatter.format(data.price)}`
            : "";
    } catch (error) {
        console.error("Error fetching most expensive product:", error);
    }
}

// --- 4. UI Rendering Functions ---

/**
 * Dynamically renders the product rows into the table DOM structure.
 */
function renderTable(products) {
    if (products.length === 0) {
        productRows.innerHTML = "";
        emptyState.classList.remove("hidden");
        return;
    }

    emptyState.classList.add("hidden");
    productRows.innerHTML = products.map(p => `
        <tr data-id="${p.id}" style="cursor: pointer;">
            <td class="name">${p.name}</td>
            <td class="num price">${dkkFormatter.format(p.price)}</td>
            <td class="num">${p.stock}</td>
            <td>${p.release_date}</td>
        </tr>
    `).join("");
}

// --- 5. Event Listeners ---

// Listen for standard selection changes
categoryFilter.addEventListener("change", fetchAndRenderProducts);
sortSelect.addEventListener("change", fetchAndRenderProducts);

// Use 'input' instead of 'change' for numerical ranges to instantly filter while typing
minPriceInput.addEventListener("input", fetchAndRenderProducts);
maxPriceInput.addEventListener("input", fetchAndRenderProducts);

// Optimized Event Delegation for table row clicks (Redirects to details page)
productRows.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    if (row && row.dataset.id) {
        window.location.href = `product.html?id=${row.dataset.id}`;
    }
});

// --- 6. Initial Dashboard Setup Lifecycle ---
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCategories();
    await fetchAndRenderProducts();
});