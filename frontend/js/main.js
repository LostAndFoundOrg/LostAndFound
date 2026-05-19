const itemsContainer = document.getElementById("itemsContainer");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");
const locationFilter = document.getElementById("locationFilter");
const sortSelect = document.getElementById("sortSelect");
const filterButton = document.getElementById("filterButton");
const filterChips = document.querySelectorAll(".filter-chip");

let allItems = [];
let selectedType = "ALL";

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategoriesForFilter();
    await loadItems();
    setupFilters();
});

async function loadCategoriesForFilter() {
    try {
        const categories = await getCategories();

        categories.forEach((category) => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;

            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error("Error while loading categories for filter:", error);
    }
}

async function loadItems() {
    try {
        showLoadingState();

        const items = await getApprovedItems();

        console.log("Approved items from backend:", items);

        allItems = items;
        renderItems(allItems);
    } catch (error) {
        console.error("Error while loading approved items:", error);
        showErrorState();
    }
}

function setupFilters() {
    filterChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            filterChips.forEach((item) => item.classList.remove("active"));
            chip.classList.add("active");

            selectedType = chip.dataset.type;
            applyFilters();
        });
    });

    filterButton.addEventListener("click", applyFilters);

    searchInput.addEventListener("input", applyFilters);
    locationFilter.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    sortSelect.addEventListener("change", applyFilters);
}

function applyFilters() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const locationValue = locationFilter.value.trim().toLowerCase();
    const categoryValue = categoryFilter.value;
    const sortValue = sortSelect.value;

    let filteredItems = [...allItems];

    if (selectedType !== "ALL") {
        filteredItems = filteredItems.filter((item) => item.type === selectedType);
    }

    if (searchValue) {
        filteredItems = filteredItems.filter((item) => {
            const title = item.title ? item.title.toLowerCase() : "";
            const description = item.description ? item.description.toLowerCase() : "";
            const category = item.categoryName
                ? item.categoryName.toLowerCase()
                : "";
            const location = item.location ? item.location.toLowerCase() : "";

            return (
                title.includes(searchValue) ||
                description.includes(searchValue) ||
                category.includes(searchValue) ||
                location.includes(searchValue)
            );
        });
    }

    if (locationValue) {
        filteredItems = filteredItems.filter((item) => {
            const location = item.location ? item.location.toLowerCase() : "";
            return location.includes(locationValue);
        });
    }

    if (categoryValue) {
        filteredItems = filteredItems.filter((item) => {
            return String(item.categoryId) === categoryValue;
        });
    }

    filteredItems.sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);

        if (sortValue === "oldest") {
            return dateA - dateB;
        }

        return dateB - dateA;
    });

    renderItems(filteredItems);
}

function renderItems(items) {
    itemsContainer.innerHTML = "";

    if (!items || items.length === 0) {
        showEmptyState();
        return;
    }

    items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "item-card";

        const imageUrl = isValidImageUrl(item.imageUrl)
            ? item.imageUrl
            : "https://placehold.co/600x400?text=No+Image";

        card.innerHTML = `
      <div class="item-image-wrapper">
        <img
          src="${imageUrl}"
          alt="${item.title}"
          class="item-image"
        >
      </div>

      <div class="item-card-body">
        <div class="badges-row">
          <span class="type-badge ${getTypeBadgeClass(item.type)}">
            ${formatType(item.type)}
          </span>

          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${formatStatus(item.status)}
          </span>
        </div>

        <h3 class="item-title">${item.title}</h3>

        <div class="item-meta">
          <p>
            <span>Category:</span>
            ${item.categoryName || "No category"}
          </p>

          <p>
            <span>Location:</span>
            ${item.location}
          </p>

          <p>
            <span>Date:</span>
            ${formatDate(item.eventDate)}
          </p>
        </div>

        <p class="item-description">
          ${shortenText(item.description, 110)}
        </p>

        <a href="item-details.html?id=${item.id}" class="btn btn-card">
          View details
        </a>
      </div>
    `;

        itemsContainer.appendChild(card);
    });
}

function showLoadingState() {
    itemsContainer.innerHTML = `
    <div class="loading-state">
      Loading items...
    </div>
  `;
}

function showEmptyState() {
    itemsContainer.innerHTML = `
    <div class="empty-state">
      <h3>No items found</h3>
      <p>Try changing your search or filters.</p>
    </div>
  `;
}

function showErrorState() {
    itemsContainer.innerHTML = `
    <div class="error-state">
      <h3>Failed to load items</h3>
      <p>Please check if backend is running and try again.</p>
    </div>
  `;
}

function getTypeBadgeClass(type) {
    if (type === "LOST") {
        return "type-lost";
    }

    if (type === "FOUND") {
        return "type-found";
    }

    return "";
}

function getStatusBadgeClass(status) {
    if (status === "APPROVED") {
        return "status-approved";
    }

    if (status === "PENDING") {
        return "status-pending";
    }

    if (status === "RETURNED") {
        return "status-returned";
    }

    if (status === "REJECTED") {
        return "status-rejected";
    }

    if (status === "CLOSED") {
        return "status-closed";
    }

    return "";
}

function formatType(type) {
    if (type === "LOST") {
        return "Lost";
    }

    if (type === "FOUND") {
        return "Found";
    }

    return type;
}

function formatStatus(status) {
    if (!status) {
        return "Unknown";
    }

    return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(dateString) {
    if (!dateString) {
        return "No date";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

function shortenText(text, maxLength) {
    if (!text) {
        return "";
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.slice(0, maxLength) + "...";
}

function isValidImageUrl(url) {
    if (!url) {
        return false;
    }

    return (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("./") ||
        url.startsWith("/")
    );
}