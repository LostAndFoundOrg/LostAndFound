const detailsContainer = document.getElementById("detailsContainer");
const matchesContainer = document.getElementById("matchesContainer");

document.addEventListener("DOMContentLoaded", loadItemDetails);

async function loadItemDetails() {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("id");

    if (!itemId) {
        showDetailsError("Item ID is missing.");
        return;
    }

    try {
        const item = await getItemById(itemId);
        renderItemDetails(item);

      
        loadMatches(itemId, item.type);
    } catch (error) {
        console.error("Error while loading item details:", error);
        showDetailsError("Failed to load item details.");
    }
}


async function loadMatches(itemId, itemType) {
    matchesContainer.innerHTML = `
        <div class="matches-loading">
            <span class="ai-badge">✦ AI</span> Searching for similar items...
        </div>`;

    try {
        const matches = await getSimilarMatches(itemId);

        if (!matches || matches.length === 0) {
            const oppositeType = itemType === "LOST" ? "found" : "lost";
            matchesContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No similar matches yet</h3>
                    <p>No ${oppositeType} items matching this description were found.</p>
                </div>`;
            return;
        }

        matchesContainer.innerHTML = matches.map(match => renderMatchCard(match)).join("");

    } catch (error) {
        console.error("Error loading matches:", error);
        matchesContainer.innerHTML = `
            <div class="empty-state">
                <h3>Could not load matches</h3>
                <p>Please try refreshing the page.</p>
            </div>`;
    }
}

function renderMatchCard(item) {
    const imageUrl = isValidImageUrl(item.imageUrl)
        ? item.imageUrl
        : "https://placehold.co/400x260/F3F4F6/9CA3AF?text=No+Image";

    return `
        <a href="item-details.html?id=${item.id}" class="match-card">
            <div class="match-card-image">
                <img src="${imageUrl}" alt="${item.title}">
                <span class="type-badge ${getTypeBadgeClass(item.type)} match-type-badge">
                    ${formatType(item.type)} item
                </span>
            </div>
            <div class="match-card-body">
                <h3 class="match-card-title">${item.title}</h3>
                <p class="match-card-desc">${item.description}</p>
                <div class="match-card-meta">
                    <span>📁 ${item.categoryName || "No category"}</span>
                    <span>📍 ${item.location || "No location"}</span>
                    <span>📅 ${formatDate(item.eventDate)}</span>
                </div>
                <div class="match-card-contact">
                    ${item.contactMethod}: ${item.contactValue}
                </div>
            </div>
        </a>`;
}

function renderItemDetails(item) {
    const imageUrl = isValidImageUrl(item.imageUrl)
        ? item.imageUrl
        : "https://placehold.co/800x520/F3F4F6/9CA3AF?text=No+Image";

    detailsContainer.innerHTML = `
    <article class="details-card">

      <div class="details-image-wrapper">
        <img
          src="${imageUrl}"
          alt="${item.title}"
          class="details-image"
        >
      </div>

      <div class="details-content">
        <div class="badges-row details-badges">
          <span class="type-badge ${getTypeBadgeClass(item.type)}">
            ${formatType(item.type)}
          </span>

          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${formatStatus(item.status)}
          </span>
        </div>

        <h1>${item.title}</h1>

        <p class="details-description">
          ${item.description}
        </p>

        <div class="details-info">
          <div>
            <span>Category</span>
            <strong>${item.categoryName || "No category"}</strong>
          </div>

          <div>
            <span>Location</span>
            <strong>${item.location || "No location"}</strong>
          </div>

          <div>
            <span>Date</span>
            <strong>${formatDate(item.eventDate)}</strong>
          </div>

          <div>
            <span>Contact name</span>
            <strong>${item.contactName || "No contact name"}</strong>
          </div>

          <div>
            <span>Contact method</span>
            <strong>${item.contactMethod || "No contact method"}</strong>
          </div>

          <div>
            <span>Contact value</span>
            <strong>${item.contactValue || "No contact value"}</strong>
          </div>
        </div>

      </div>

    </article>
  `;
}

function showDetailsError(message) {
    detailsContainer.innerHTML = `
    <div class="error-state">
      <h3>${message}</h3>
      <p>Please go back to the home page and try again.</p>
    </div>
  `;
}

function isValidImageUrl(url) {
    if (!url) return false;
    return (
        url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("./") ||
        url.startsWith("/")
    );
}

function getTypeBadgeClass(type) {
    if (type === "LOST") return "type-lost";
    if (type === "FOUND") return "type-found";
    return "";
}

function getStatusBadgeClass(status) {
    if (status === "APPROVED") return "status-approved";
    if (status === "PENDING") return "status-pending";
    if (status === "RETURNED") return "status-returned";
    if (status === "REJECTED") return "status-rejected";
    if (status === "CLOSED") return "status-closed";
    return "";
}

function formatType(type) {
    if (type === "LOST") return "Lost";
    if (type === "FOUND") return "Found";
    return type || "Unknown";
}

function formatStatus(status) {
    if (!status) return "Unknown";
    return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(dateString) {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
