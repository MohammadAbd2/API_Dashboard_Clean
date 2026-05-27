const API_BASE = "http://localhost:8000";

const form = document.getElementById("create-product-form");
const categorySelect = form.category_id;
const result = document.getElementById("result");

async function loadCategories() {
    const res = await fetch(`${API_BASE}/categories`);
    const cats = await res.json();
    for (const c of cats) {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
    }
}

function showResult(message, ok) {
    result.textContent = "";
    if (typeof message === "string") {
        result.textContent = message;
    } else {
        result.appendChild(message);
    }
    result.classList.remove("hidden");
    result.classList.toggle("result-error", !ok);
    result.classList.toggle("result-ok", ok);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let specs = {};
    try {
        specs = JSON.parse(form.specs.value || "{}");
    } catch {
        showResult("Specs must be valid JSON.", false);
        return;
    }
    const payload = {
        name: form.name.value,
        category_id: parseInt(form.category_id.value, 10),
        price: parseFloat(form.price.value),
        stock: parseInt(form.stock.value, 10),
        release_date: form.release_date.value,
        specs,
    };
    const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (res.ok) {
        const data = await res.json();
        const frag = document.createDocumentFragment();
        frag.append(`Created product #${data.id}. `);
        const link = document.createElement("a");
        link.href = `product.html?id=${data.id}`;
        link.textContent = "View";
        frag.append(link);
        showResult(frag, true);
        form.reset();
        form.specs.value = "{}";
    } else {
        const err = await res.text();
        showResult(`Error: ${err}`, false);
    }
});

loadCategories();
