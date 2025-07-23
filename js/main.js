// js/main.js
import {
  mockData,
  statusMapping,
  colorPalette,
  getStatusBadge,
} from "./data.js";
import { checkLoginStatus, setupAuthListeners } from "./auth.js";
import { renderDashboard } from "./dashboard.js";
import {
  renderRequirementsTable,
  setupRequirementsListeners,
} from "./requirements.js";
import {
  renderCandidatesTable,
  setupCandidatesListeners,
} from "./candidates.js";
import { renderApprovalLists, setupApprovalListeners } from "./approvals.js";
import { openModal, closeModal, setupModalListeners } from "./modals.js";

// Global render function to re-render all dynamic parts of the application
const renderAll = () => {
  renderDashboard();
  renderRequirementsTable();
  renderCandidatesTable();
  renderApprovalLists();
};

// Expose global functions/data if needed (e.g., for direct console access or specific interactions)
// This is generally discouraged for production, but useful for quick debugging in development
window.mockData = mockData;
window.statusMapping = statusMapping;
window.colorPalette = colorPalette;
window.getStatusBadge = getStatusBadge;
window.renderAll = renderAll;
window.openModal = openModal;
window.closeModal = closeModal;

// Event listener for when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Setup authentication listeners first, passing renderAll as a callback
  // so the app content can be rendered after successful login/logout
  setupAuthListeners(renderAll);

  // Setup navigation listeners for switching between sections
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".app-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = e.target.dataset.section + "-section";

      // Remove 'active' class from all nav links and add to the clicked one
      navLinks.forEach((l) => l.classList.remove("active"));
      e.target.classList.add("active");

      // Hide all sections and show the target section
      sections.forEach((s) => s.classList.add("hidden"));
      document.getElementById(sectionId).classList.remove("hidden");
    });
  });

  // Setup listeners for each major section of the application
  // Pass necessary callbacks (like renderAll, openModal, closeModal) to each module
  setupRequirementsListeners(renderAll, openModal, closeModal);
  setupCandidatesListeners(renderAll, openModal, closeModal);
  setupApprovalListeners(renderAll);
  setupModalListeners(); // General modal listeners (e.g., close button for view candidates modal)

  // Initial check of login status and render app content if already logged in
  checkLoginStatus();
});
