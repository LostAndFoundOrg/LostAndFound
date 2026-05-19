const itemsContainer = document.getElementById("itemsContainer");

document.addEventListener("DOMContentLoaded", loadItems);

async function loadItems() {
    try {
        const items = await getApprovedItems();

        console.log("Approved items from backend:", items);

        itemsContainer.innerHTML = "";

        if (items.length === 0) {
            itemsContainer.innerHTML = "<p>No approved items yet.</p>";
            return;
        }

        items.forEach((item) => {
            const card = document.createElement("div");
            card.className = "item-card";

            card.innerHTML = `
        <h3>${item.title}</h3>
        <p><strong>Description:</strong> ${item.description}</p>
        <p><strong>Category:</strong> ${item.category ? item.category.name : "No category"}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Date:</strong> ${item.eventDate}</p>
        <p><strong>Contact:</strong> ${item.contactName} — ${item.contactMethod}: ${item.contactValue}</p>
      `;

            itemsContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Error while loading approved items:", error);
        itemsContainer.innerHTML = "<p>Failed to load items.</p>";
    }
}