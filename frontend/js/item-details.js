const detailsContainer = document.getElementById("detailsContainer");
const matchesContainer = document.getElementById("matchesContainer");

document.addEventListener("DOMContentLoaded", async () => {
    const itemId = getItemIdFromUrl();

    if (!itemId) {
        showDetailsError("Item ID is missing.");
        showMatchesEmptyState("Cannot load matches without item ID.");
        return;
    }

    await loadItemDetails(itemId);
    await loadSimilarMatches(itemId);
});

function getItemIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadItemDetails(itemId) {
    try {
        showDetailsLoading();

        const item = await getItemById(itemId);

        console.log("Item details:", item);

        renderItemDetails(item);
    } catch (error) {
        console.error("Error while loading item details:", error);
        showDetailsError("Failed to load item details.");
    }
}

async function loadSimilarMatches(itemId) {
    try {
        showMatchesLoading();

        const matches = await getSimilarMatches(itemId);

        console.log("Similar matches:", matches);

        renderSimilarMatches(matches);
    } catch (error) {
        console.error("Error while loading similar matches:", error);
        showMatchesEmptyState("Failed to load similar matches.");
    }
}

function renderItemDetails(item) {
    const imageUrl = isValidImageUrl(item.imageUrl)
        ? item.imageUrl
        : "https://placehold.co/900x620/F3F4F6/9CA3AF?text=No+Image";

    detailsContainer.innerHTML = `
    <article class="details-card">
      <div class="details-image-wrapper">
        <img
          src="${imageUrl}"
          alt="${escapeHtml(item.title || "Item image")}"
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

        <h1>${escapeHtml(item.title || "Untitled item")}</h1>

        <p class="details-description">
          ${escapeHtml(item.description || "No description provided.")}
        </p>

        <div class="details-info-grid">
          <div class="details-info-card">
            <span>Category</span>
            <strong>${escapeHtml(item.categoryName || "No category")}</strong>
          </div>

          <div class="details-info-card">
            <span>Location</span>
            <strong>${escapeHtml(item.location || "No location")}</strong>
          </div>

          <div class="details-info-card">
            <span>Date</span>
            <strong>${formatDate(item.eventDate)}</strong>
          </div>

          <div class="details-info-card">
            <span>Status</span>
            <strong>${formatStatus(item.status)}</strong>
          </div>
        </div>

        <div class="details-contact-card">
          <h3>Contact information</h3>

          <div class="contact-row">
            <span>Name</span>
            <strong>${escapeHtml(item.contactName || "No contact name")}</strong>
          </div>

          <div class="contact-row">
            <span>Method</span>
            <strong>${escapeHtml(item.contactMethod || "No contact method")}</strong>
          </div>

          <div class="contact-row">
            <span>Contact</span>
            <strong>${escapeHtml(item.contactValue || "No contact value")}</strong>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderSimilarMatches(matches) {
    matchesContainer.innerHTML = "";

    if (!matches || matches.length === 0) {
        showMatchesEmptyState("No similar matches found for this item.");
        return;
    }

    matches.forEach((item) => {
        const matchCard = document.createElement("article");
        matchCard.className = "match-card";

        const imageUrl = isValidImageUrl(item.imageUrl)
            ? item.imageUrl
            : "https://placehold.co/600x400/F3F4F6/9CA3AF?text=No+Image";

        matchCard.innerHTML = `
      <div class="match-image-wrapper">
        <img
          src="${imageUrl}"
          alt="${escapeHtml(item.title || "Match image")}"
          class="match-image"
        >
      </div>

      <div class="match-card-body">
        <div class="badges-row">
          <span class="type-badge ${getTypeBadgeClass(item.type)}">
            ${formatType(item.type)}
          </span>

          <span class="status-badge ${getStatusBadgeClass(item.status)}">
            ${formatStatus(item.status)}
          </span>
        </div>

        <h3>${escapeHtml(item.title || "Untitled item")}</h3>

        <div class="match-meta">
          <p>
            <span>Category:</span>
            ${escapeHtml(item.categoryName || "No category")}
          </p>

          <p>
            <span>Location:</span>
            ${escapeHtml(item.location || "No location")}
          </p>

          <p>
            <span>Date:</span>
            ${formatDate(item.eventDate)}
          </p>
        </div>

        <p class="match-description">
          ${escapeHtml(shortenText(item.description, 90))}
        </p>

        <a href="item-details.html?id=${item.id}" class="btn btn-card">
          View details
        </a>
      </div>
    `;

        matchesContainer.appendChild(matchCard);
    });
}

function showDetailsLoading() {
    detailsContainer.innerHTML = `
    <div class="loading-state">
      Loading item details...
    </div>
  `;
}

function showDetailsError(message) {
    detailsContainer.innerHTML = `
    <div class="error-state">
      <h3>${escapeHtml(message)}</h3>
      <p>Please go back to the home page and try again.</p>
    </div>
  `;
}

function showMatchesLoading() {
    matchesContainer.innerHTML = `
    <div class="loading-state">
      Loading similar matches...
    </div>
  `;
}

function showMatchesEmptyState(message) {
    matchesContainer.innerHTML = `
    <div class="empty-state">
      <h3>${escapeHtml(message)}</h3>
      <p>Try checking another item or create more related lost/found announcements.</p>
    </div>
  `;
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
        return "Lost item";
    }

    if (type === "FOUND") {
        return "Found item";
    }

    return type || "Unknown type";
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

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

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

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}