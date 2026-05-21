const itemForm = document.getElementById("itemForm");
const categorySelect = document.getElementById("categoryId");
const formMessage = document.getElementById("formMessage");
const typeSelect = document.getElementById("type");
const eventDateInput = document.getElementById("eventDate");

document.addEventListener("DOMContentLoaded", async () => {
    setInitialTypeFromUrl();
    setMaxDateToday();
    await loadCategories();
});

itemForm.addEventListener("submit", handleSubmit);

function setInitialTypeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const typeFromUrl = params.get("type");

    if (typeFromUrl === "LOST" || typeFromUrl === "FOUND") {
        typeSelect.value = typeFromUrl;
    }
}

function setMaxDateToday() {
    const today = new Date().toISOString().split("T")[0];
    eventDateInput.max = today;
}

async function loadCategories() {
    try {
        const categories = await getCategories();

        console.log("Categories for form:", categories);

        categories.forEach((category) => {
            const option = document.createElement("option");

            option.value = category.id;
            option.textContent = category.name;

            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error("Error while loading categories:", error);
        showMessage("Failed to load categories.", "error-message");
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData();

    formData.append("type", document.getElementById("type").value);
    formData.append("title", document.getElementById("title").value.trim());
    formData.append("description", document.getElementById("description").value.trim());
    formData.append("categoryId", document.getElementById("categoryId").value);
    formData.append("location", document.getElementById("location").value.trim());
    formData.append("eventDate", document.getElementById("eventDate").value);
    formData.append("contactName", document.getElementById("contactName").value.trim());
    formData.append("contactMethod", document.getElementById("contactMethod").value);
    formData.append("contactValue", document.getElementById("contactValue").value.trim());

    const imageInput = document.getElementById("image");

    if (imageInput && imageInput.files.length > 0) {
        formData.append("image", imageInput.files[0]);
    }

    console.log("Form data before sending:", Object.fromEntries(formData.entries()));

    try {
        const createdItem = await createItem(formData);

        console.log("Created item:", createdItem);

        showMessage(
            "Item submitted successfully. It is waiting for approval.",
            "success-message"
        );

        itemForm.reset();
        setInitialTypeFromUrl();
        setMaxDateToday();
    } catch (error) {
        console.error("Error while creating item:", error);

        showMessage(
            "Failed to create item. Please check the form data.",
            "error-message"
        );
    }
}

function showMessage(text, className) {
    formMessage.textContent = text;
    formMessage.className = className;
}