// js/auth.js
// This file handles user authentication logic

const USERNAME = "user"; // Hardcoded username for demo
const PASSWORD = "password"; // Hardcoded password for demo

// Elements related to login/logout
const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app");
const loginForm = document.getElementById("login-form");
const logoutButton = document.getElementById("logout-button");
const loginMessage = document.getElementById("login-message");

/**
 * Checks the login status from sessionStorage and updates UI visibility.
 * @param {function} renderAllCallback - Callback function to render the main app content after login.
 */
export const checkLoginStatus = (renderAllCallback) => {
  if (sessionStorage.getItem("loggedIn") === "true") {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    if (renderAllCallback) {
      renderAllCallback(); // Render app content after login
    }
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
};

/**
 * Sets up event listeners for authentication related elements.
 * @param {function} renderAllCallback - Callback function to render the main app content after login.
 */
export const setupAuthListeners = (renderAllCallback) => {
  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;

    if (usernameInput === USERNAME && passwordInput === PASSWORD) {
      sessionStorage.setItem("loggedIn", "true");
      loginMessage.classList.add("hidden");
      checkLoginStatus(renderAllCallback); // Pass callback
    } else {
      loginMessage.textContent = "Invalid username or password.";
      loginMessage.classList.remove("hidden");
    }
  });

  logoutButton?.addEventListener("click", () => {
    sessionStorage.removeItem("loggedIn");
    checkLoginStatus(renderAllCallback); // Pass callback
  });

  // Initial check when listeners are set up
  checkLoginStatus(renderAllCallback);
};
