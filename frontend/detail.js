const API_BASE = "http://localhost:8000";

const detailContent = document.getElementById("detail-content");
const reviewsList = document.getElementById("reviews-list");
const reviewForm = document.getElementById("review-form");
const editToggle = document.getElementById("edit-toggle");
const editForm = document.getElementById("edit-form");
const editCancel = document.getElementById("edit-cancel");
const deleteBtn = document.getElementById("delete-product");

const dkk = new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
});

const productId = parseInt(new URLSearchParams(window.location.search).get("id"), 10);
let currentProduct = null;

async function loadProduct() {
    if (!productId) {
        detailContent.innerHTML = "<p>Product not found.</p>";
        return;
    }
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if (!res.ok) {
        detailContent.innerHTML = "<p>Product not found.</p>";
        return;
    }
    const p = await res.json();
    currentProduct = p;
    document.title = `${p.name} · Dashboard`;
    detailContent.innerHTML = `
        <h2>${p.name}</h2>
        <p class="price detail-price">${dkk.format(p.price)}</p>
        <p>${p.stock} in stock</p>
        <p>Released: ${p.release_date}</p>
        <pre>${JSON.stringify(p.specs, null, 2)}</pre>
    `;
}

async function loadReviews() {
    const res = await fetch(`${API_BASE}/products/${productId}/reviews`);
    const reviews = await res.json();
    reviewsList.innerHTML = reviews.length === 0
        ? "<p>No reviews yet.</p>"
        : reviews.map(r => `
            <div class="review" data-id="${r.id}">
                <div class="review-head">
                    <strong>${r.author_name}</strong> — ${"★".repeat(r.rating)}
                    <button class="review-delete" data-id="${r.id}" title="Delete review">×</button>
                </div>
                <p>${r.comment ?? ""}</p>
            </div>
        `).join("");
    for (const btn of reviewsList.querySelectorAll(".review-delete")) {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation();
            if (!confirm("Delete this review?")) return;
            const id = btn.dataset.id;
            const res = await fetch(`${API_BASE}/reviews/${id}`, { method: "DELETE" });
            if (res.ok) await loadReviews();
        });
    }
}

reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
        product_id: productId,
        author_name: form.author_name.value,
        rating: parseInt(form.rating.value, 10),
        comment: form.comment.value || null,
    };
    const res = await fetch(`${API_BASE}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (res.ok) {
        form.reset();
        await loadReviews();
    }
});

editToggle.addEventListener("click", () => {
    if (!currentProduct) return;
    editForm.name.value = currentProduct.name;
    editForm.price.value = currentProduct.price;
    editForm.stock.value = currentProduct.stock;
    editForm.classList.remove("hidden");
});

editCancel.addEventListener("click", () => {
    editForm.classList.add("hidden");
});

editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentProduct) return;
    const payload = {
        name: editForm.name.value,
        category_id: currentProduct.category_id,
        price: parseFloat(editForm.price.value),
        stock: parseInt(editForm.stock.value, 10),
        release_date: currentProduct.release_date,
        specs: currentProduct.specs ?? {},
    };
    const res = await fetch(`${API_BASE}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (res.ok) {
        editForm.classList.add("hidden");
        await loadProduct();
    }
});

deleteBtn.addEventListener("click", async () => {
    if (!confirm(`Delete "${currentProduct?.name}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_BASE}/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
        window.location.href = "index.html";
    }
});

loadProduct().then(loadReviews);
