const detailsContainer = document.getElementById("detailsContainer");

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

        console.log("Item details:", item);

        renderItemDetails(item);
    } catch (error) {
        console.error("Error while loading item details:", error);
        showDetailsError("Failed to load item details.");
    }
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

        <button type="button" class="btn btn-success">
          Mark as returned
        </button>
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
        return "Lost";
    }

    if (type === "FOUND") {
        return "Found";
    }

    return type || "Unknown";
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