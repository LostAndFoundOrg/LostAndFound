const adminItemsTableBody = document.getElementById("adminItemsTableBody");
const adminStatusFilter = document.getElementById("adminStatusFilter");
const refreshAdminItemsButton = document.getElementById("refreshAdminItemsButton");
const adminMessage = document.getElementById("adminMessage");

const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");
const returnedCount = document.getElementById("returnedCount");

let allAdminItems = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadAdminItems();

    adminStatusFilter.addEventListener("change", applyAdminFilter);
    refreshAdminItemsButton.addEventListener("click", loadAdminItems);
});

async function loadAdminItems() {
    try {
        showAdminLoading();

        const items = await getAdminItems();

        console.log("Admin items:", items);

        allAdminItems = items;

        updateStats(allAdminItems);
        applyAdminFilter();
    } catch (error) {
        console.error("Error while loading admin items:", error);
        showAdminError();
    }
}

function applyAdminFilter() {
    const selectedStatus = adminStatusFilter.value;

    let filteredItems = [...allAdminItems];

    if (selectedStatus !== "ALL") {
        filteredItems = filteredItems.filter((item) => item.status === selectedStatus);
    }

    renderAdminItems(filteredItems);
}

function updateStats(items) {
    pendingCount.textContent = countByStatus(items, "PENDING");
    approvedCount.textContent = countByStatus(items, "APPROVED");
    rejectedCount.textContent = countByStatus(items, "REJECTED");
    returnedCount.textContent = countByStatus(items, "RETURNED");
}

function countByStatus(items, status) {
    return items.filter((item) => item.status === status).length;
}

function renderAdminItems(items) {
    adminItemsTableBody.innerHTML = "";

    if (!items || items.length === 0) {
        adminItemsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="admin-empty-cell">
          No items found for this status.
        </td>
      </tr>
    `;
        return;
    }

    items.forEach((item) => {
        const row = document.createElement("tr");

        row.innerHTML = `
      <td>
        <div class="admin-item-cell">
          <div class="admin-item-title">
            ${escapeHtml(item.title || "Untitled item")}
          </div>
          <div class="admin-item-description">
            ${escapeHtml(shortenText(item.description, 70))}
          </div>
        </div>
      </td>

      <td>
        <span class="type-badge ${getTypeBadgeClass(item.type)}">
          ${formatType(item.type)}
        </span>
      </td>

      <td>${escapeHtml(item.categoryName || "No category")}</td>

      <td>${escapeHtml(item.location || "No location")}</td>

      <td>${formatDate(item.eventDate)}</td>

      <td>
        <span class="status-badge ${getStatusBadgeClass(item.status)}">
          ${formatStatus(item.status)}
        </span>
      </td>

      <td>
        <div class="admin-contact">
          ${escapeHtml(formatContact(item.contactMethod, item.contactValue))}
        </div>
      </td>

      <td>
        <div class="admin-actions">
          <button
            type="button"
            class="admin-action-btn approve-btn"
            data-action="approve"
            data-id="${item.id}"
            ${item.status === "APPROVED" ? "disabled" : ""}
          >
            Approve
          </button>

          <button
            type="button"
            class="admin-action-btn reject-btn"
            data-action="reject"
            data-id="${item.id}"
            ${item.status === "REJECTED" ? "disabled" : ""}
          >
            Reject
          </button>

          <button
            type="button"
            class="admin-action-btn return-btn"
            data-action="return"
            data-id="${item.id}"
            ${item.status === "RETURNED" ? "disabled" : ""}
          >
            Return
          </button>
        </div>
      </td>
    `;

        adminItemsTableBody.appendChild(row);
    });

    attachAdminActionListeners();
}

function attachAdminActionListeners() {
    const actionButtons = document.querySelectorAll(".admin-action-btn");

    actionButtons.forEach((button) => {
        button.addEventListener("click", async () => {
            const itemId = button.dataset.id;
            const action = button.dataset.action;

            await handleAdminAction(itemId, action);
        });
    });
}

async function handleAdminAction(itemId, action) {
    try {
        clearAdminMessage();

        if (action === "approve") {
            await approveItem(itemId);
            showAdminMessage("Item approved successfully.", "success-message");
        }

        if (action === "reject") {
            await rejectItem(itemId);
            showAdminMessage("Item rejected successfully.", "success-message");
        }

        if (action === "return") {
            await returnItem(itemId);
            showAdminMessage("Item marked as returned.", "success-message");
        }

        await loadAdminItems();
    } catch (error) {
        console.error("Admin action failed:", error);
        showAdminMessage("Action failed. Please check backend endpoint.", "error-message");
    }
}

function showAdminLoading() {
    adminItemsTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="admin-empty-cell">
        Loading admin items...
      </td>
    </tr>
  `;
}

function showAdminError() {
    adminItemsTableBody.innerHTML = `
    <tr>
      <td colspan="8" class="admin-empty-cell">
        Failed to load admin items. Please check backend.
      </td>
    </tr>
  `;
}

function showAdminMessage(text, className) {
    adminMessage.textContent = text;
    adminMessage.className = className;
}

function clearAdminMessage() {
    adminMessage.textContent = "";
    adminMessage.className = "";
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

function formatContact(contactMethod, contactValue) {
    if (!contactMethod && !contactValue) {
        return "No contact";
    }

    if (!contactMethod) {
        return contactValue;
    }

    if (!contactValue) {
        return contactMethod;
    }

    return `${contactMethod} - ${contactValue}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}