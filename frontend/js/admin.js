const adminToken = localStorage.getItem("adminToken");
const adminRole = localStorage.getItem("adminRole");

if (!adminToken || adminToken === "undefined" || adminRole !== "ADMIN") {
    window.location.href = "admin-login.html";
}


const adminItemsTableBody = document.getElementById("adminItemsTableBody");
const adminStatusFilter = document.getElementById("adminStatusFilter");
const refreshAdminItemsButton = document.getElementById("refreshAdminItemsButton");
const adminMessage = document.getElementById("adminMessage");
const logoutButton = document.getElementById("logoutButton");

const pendingCount = document.getElementById("pendingCount");
const approvedCount = document.getElementById("approvedCount");
const rejectedCount = document.getElementById("rejectedCount");
const returnedCount = document.getElementById("returnedCount");

let allAdminItems = [];

document.addEventListener("DOMContentLoaded", async () => {
    if (adminStatusFilter) adminStatusFilter.addEventListener("change", applyAdminFilter);
    if (refreshAdminItemsButton) refreshAdminItemsButton.addEventListener("click", loadAdminItems);

    if (logoutButton) {
        logoutButton.addEventListener("click", handleLogout);
    }

    await loadAdminItems();
});

async function loadAdminItems() {
    try {
        showAdminLoading();
        const items = await getAdminItems();
        allAdminItems = items;
        updateStats(allAdminItems);
        applyAdminFilter();
    } catch (error) {
        console.error("Error while loading admin items:", error);
        showAdminError();
        showAdminMessage("Session expired or unauthorized. Please login again.", "error-message");
    }
}

function applyAdminFilter() {
    if (!adminStatusFilter) return;
    const selectedStatus = adminStatusFilter.value;
    let filteredItems = [...allAdminItems];

    if (selectedStatus !== "ALL") {
        filteredItems = filteredItems.filter((item) => item.status === selectedStatus);
    }

    renderAdminItems(filteredItems);
}

function updateStats(items) {
    if (pendingCount) pendingCount.textContent = countByStatus(items, "PENDING");
    if (approvedCount) approvedCount.textContent = countByStatus(items, "APPROVED");
    if (rejectedCount) rejectedCount.textContent = countByStatus(items, "REJECTED");
    if (returnedCount) returnedCount.textContent = countByStatus(items, "RETURNED");
}

function countByStatus(items, status) {
    return items.filter((item) => item.status === status).length;
}

function renderAdminItems(items) {
    if (!adminItemsTableBody) return;
    adminItemsTableBody.innerHTML = "";

    if (!items || items.length === 0) {
        adminItemsTableBody.innerHTML = `
      <tr>
        <td colspan="8" class="admin-empty-cell">No items found for this status.</td>
      </tr>`;
        return;
    }

    items.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
      <td>
        <div class="admin-item-cell">
          <div class="admin-item-title">${escapeHtml(item.title || "Untitled item")}</div>
          <div class="admin-item-description">${escapeHtml(shortenText(item.description, 70))}</div>
        </div>
      </td>
      <td><span class="type-badge ${getTypeBadgeClass(item.type)}">${formatType(item.type)}</span></td>
      <td>${escapeHtml(item.categoryName || "No category")}</td>
      <td>${escapeHtml(item.location || "No location")}</td>
      <td>${formatDate(item.eventDate)}</td>
      <td><span class="status-badge ${getStatusBadgeClass(item.status)}">${formatStatus(item.status)}</span></td>
      <td><div class="admin-contact">${escapeHtml(formatContact(item.contactMethod, item.contactValue))}</div></td>
      <td>
        <div class="admin-actions">
          <button type="button" class="admin-action-btn approve-btn"
            data-action="approve" data-id="${item.id}"
            ${item.status === "APPROVED" ? "disabled" : ""}>Approve</button>
          <button type="button" class="admin-action-btn reject-btn"
            data-action="reject" data-id="${item.id}"
            ${item.status === "REJECTED" ? "disabled" : ""}>Reject</button>
          <button type="button" class="admin-action-btn return-btn"
            data-action="return" data-id="${item.id}"
            ${item.status === "RETURNED" ? "disabled" : ""}>Return</button>
        </div>
      </td>`;
        adminItemsTableBody.appendChild(row);
    });

    attachAdminActionListeners();
}

function attachAdminActionListeners() {
    document.querySelectorAll(".admin-action-btn").forEach((button) => {
        button.addEventListener("click", async () => {
            await handleAdminAction(button.dataset.id, button.dataset.action);
        });
    });
}

async function handleAdminAction(itemId, action) {
    try {
        clearAdminMessage();
        if (action === "approve") {
            await approveItem(itemId);
            showAdminMessage("Item approved successfully.", "success-message");
        } else if (action === "reject") {
            await rejectItem(itemId);
            showAdminMessage("Item rejected successfully.", "success-message");
        } else if (action === "return") {
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
    if (adminItemsTableBody) {
        adminItemsTableBody.innerHTML = `<tr><td colspan="8" class="admin-empty-cell">Loading admin items...</td></tr>`;
    }
}

function showAdminError() {
    if (adminItemsTableBody) {
        adminItemsTableBody.innerHTML = `<tr><td colspan="8" class="admin-empty-cell">Failed to load admin items. Please login again or check backend.</td></tr>`;
    }
}

function showAdminMessage(text, className) {
    if (adminMessage) {
        adminMessage.textContent = text;
        adminMessage.className = className;
    }
}

// Fixed function declaration syntax
function clearAdminMessage() {
    if (adminMessage) {
        adminMessage.textContent = "";
        adminMessage.className = "";
    }
}

function handleLogout() {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    window.location.href = "admin-login.html";
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function getTypeBadgeClass(type) {
    if (type === "LOST") return "type-lost";
    if (type === "FOUND") return "type-found";
    return "";
}

function getStatusBadgeClass(status) {
    const map = { 
        APPROVED: "status-approved", 
        PENDING: "status-pending",
        RETURNED: "status-returned", 
        REJECTED: "status-rejected", 
        CLOSED: "status-closed" 
    };
    return map[status] || "";
}

function formatType(type) {
    if (type === "LOST") return "Lost item";
    if (type === "FOUND") return "Found item";
    return type || "Unknown type";
}

function formatStatus(status) {
    if (!status) return "Unknown";
    return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(dateString) {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function shortenText(text, maxLength) {
    if (!text) return "";
    return text.length <= maxLength ? text : text.slice(0, maxLength) + "...";
}

function formatContact(contactMethod, contactValue) {
    if (!contactMethod && !contactValue) return "No contact";
    if (!contactMethod) return contactValue;
    if (!contactValue) return contactMethod;
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

