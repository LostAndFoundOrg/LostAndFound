const itemForm = document.getElementById("itemForm");
const categorySelect = document.getElementById("categoryId");
const formMessage = document.getElementById("formMessage");

document.addEventListener("DOMContentLoaded", loadCategories);
itemForm.addEventListener("submit", handleSubmit);

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
        formMessage.textContent = "Failed to load categories.";
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const itemData = {
        type: document.getElementById("type").value,
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        categoryId: Number(document.getElementById("categoryId").value),
        location: document.getElementById("location").value.trim(),
        eventDate: document.getElementById("eventDate").value,
        imageUrl: document.getElementById("imageUrl").value.trim() || null,
        contactName: document.getElementById("contactName").value.trim(),
        contactMethod: document.getElementById("contactMethod").value.trim(),
        contactValue: document.getElementById("contactValue").value.trim()
    };

    console.log("Item data before sending:", itemData);

    try {
        const createdItem = await createItem(itemData);

        console.log("Created item:", createdItem);

        formMessage.textContent = "Item submitted successfully. It is waiting for approval.";
        formMessage.className = "success-message";

        itemForm.reset();
    } catch (error) {
        console.error("Error while creating item:", error);

        formMessage.textContent = "Failed to create item. Please check the form data.";
        formMessage.className = "error-message";
    }
}