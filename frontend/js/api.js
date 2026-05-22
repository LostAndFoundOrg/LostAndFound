async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/api/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

async function getApprovedItems() {
  const response = await fetch(`${API_BASE_URL}/api/items`);

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}

async function createItem(formData) {
  const response = await fetch(`${API_BASE_URL}/api/items`, {
    method: "POST",
    body: formData
  });

  return handleResponse(response);
}

async function getItemById(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}`);

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to fetch item details");
  }

  return response.json();
}

async function getAdminItems() {
  const response = await fetch(`${API_BASE_URL}/api/items/admin`, {
    headers: getAdminHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to fetch admin items");
  }

  return response.json();
}

async function approveItem(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}/approve`, {
    method: "PATCH",
    headers: getAdminHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to approve item");
  }

  return response.json();
}

async function rejectItem(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}/reject`, {
    method: "PATCH",
    headers: getAdminHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to reject item");
  }

  return response.json();
}

async function returnItem(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}/return`, {
    method: "PATCH",
    headers: getAdminHeaders()
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to mark item as returned");
  }

  return response.json();
}
async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Request failed");
  }

  return response.json();
}

function getAdminToken() {
  return localStorage.getItem("adminToken");
}

function getAdminHeaders() {
  const token = getAdminToken();

  return {
    "Authorization": `Bearer ${token}`
  };
}

async function loginAdmin(username, password) {
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Admin login error status:", response.status);
    console.error("Admin login error response:", errorText);

    throw new Error("Invalid admin credentials");
  }

  return response.json();
}

async function getSimilarMatches(id) {
  const response = await fetch(`${API_BASE_URL}/api/items/${id}/matches`);

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to fetch similar matches");
  }

  return response.json();

}
