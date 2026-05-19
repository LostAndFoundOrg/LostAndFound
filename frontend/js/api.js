async function getCategories() {
  const response = await fetch(`${API_BASE_URL}/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

async function getApprovedItems() {
  const response = await fetch(`${API_BASE_URL}/items`);

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}

async function createItem(itemData) {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(itemData)
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to create item");
  }

  return response.json();
}

async function getItemById(id) {
  const response = await fetch(`${API_BASE_URL}/items/${id}`);

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Backend error status:", response.status);
    console.error("Backend error response:", errorText);

    throw new Error("Failed to fetch item details");
  }

  return response.json();
}