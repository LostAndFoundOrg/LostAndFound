console.log("admin-auth.js connected");

const adminLoginForm = document.getElementById("adminLoginForm");
const loginMessage = document.getElementById("loginMessage");

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    const role = localStorage.getItem("adminRole");

    if (token && role === "ADMIN") {
        window.location.href = "admin.html";
    }
});

adminLoginForm.addEventListener("submit", handleAdminLogin);

async function handleAdminLogin(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const data = await loginAdmin(username, password);

        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminRole", data.role);

        showLoginMessage("Login successful. Redirecting...", "success-message");

        setTimeout(() => {
            window.location.href = "admin.html";
        }, 500);
    } catch (error) {
        console.error("Admin login failed:", error);

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRole");

        showLoginMessage("Invalid username or password.", "error-message");
    }
}

function showLoginMessage(text, className) {
    loginMessage.textContent = text;
    loginMessage.className = className;
}