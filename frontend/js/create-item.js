const itemForm = document.getElementById("itemForm");
const categorySelect = document.getElementById("categoryId");
const formMessage = document.getElementById("formMessage");
const typeSelect = document.getElementById("type");
const eventDateInput = document.getElementById("eventDate");
const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
const previewImg = document.getElementById("previewImg");

document.addEventListener("DOMContentLoaded", async () => {
    setInitialTypeFromUrl();
    setMaxDateToday();
    await loadCategories();
});


imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.style.display = "none";
    }
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

    const submitBtn = itemForm.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";

    // ✅ FormData автоматически включает файл если он выбран
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

    // Добавляем файл только если выбран
    const imageFile = imageInput.files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const createdItem = await createItem(formData);
        console.log("Created item:", createdItem);

        showMessage(
            "Item submitted successfully. It is waiting for approval.",
            "success-message"
        );

        itemForm.reset();
        imagePreview.style.display = "none";
        setInitialTypeFromUrl();
        setMaxDateToday();
    } catch (error) {
        console.error("Error while creating item:", error);
        showMessage(
            "Failed to create item. Please check the form data.",
            "error-message"
        );
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit item";
    }
}

function showMessage(text, className) {
    formMessage.textContent = text;
    formMessage.className = className;
}
