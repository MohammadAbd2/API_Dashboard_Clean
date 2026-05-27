const API_BASE = "http://localhost:8000";

const form = document.getElementById("create-category-form");
const result = document.getElementById("result");

function showResult(message, ok) {
    result.textContent = message;
    result.classList.remove("hidden");
    result.classList.toggle("result-error", !ok);
    result.classList.toggle("result-ok", ok);
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
        name: form.name.value,
        slug: form.slug.value,
        description: form.description.value || null,
    };
    const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (res.ok) {
        const data = await res.json();
        showResult(`Category created (id ${data.id}).`, true);
        form.reset();
    } else {
        const err = await res.text();
        showResult(`Error: ${err}`, false);
    }
});
