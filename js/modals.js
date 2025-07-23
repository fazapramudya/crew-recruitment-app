// js/modals.js
// This file handles modal (popup) functionalities

// Function to open a specific modal
export const openModal = (modalId) => {
  const backdrop = document.getElementById("modal-backdrop");
  const targetModal = document.getElementById(modalId);

  // Hide all modals first (in case one was already open)
  document
    .querySelectorAll(".modal-content")
    .forEach((m) => m.classList.add("hidden"));

  // Show the backdrop
  backdrop.classList.remove("hidden");
  // Small delay for backdrop transition (opacity)
  setTimeout(() => {
    backdrop.classList.remove("opacity-0");
    backdrop.classList.add("opacity-100");
  }, 10);

  // Show the target modal
  targetModal.classList.remove("hidden");
  // Delay for modal content transition (scale) after backdrop
  setTimeout(() => {
    targetModal.classList.remove("scale-95");
    targetModal.classList.add("scale-100");
  }, 150);
};

// Function to close any currently open modal
export const closeModal = () => {
  const backdrop = document.getElementById("modal-backdrop");
  // Find the currently visible modal
  const activeModal = document.querySelector(".modal-content:not(.hidden)");

  if (activeModal) {
    // Start modal content transition (scale down)
    activeModal.classList.remove("scale-100");
    activeModal.classList.add("scale-95");
    // Hide the modal after its transition completes
    setTimeout(() => {
      activeModal.classList.add("hidden");
    }, 300); // Match transition duration
  }

  // Start backdrop transition (opacity)
  backdrop.classList.remove("opacity-100");
  backdrop.classList.add("opacity-0");
  // Hide the backdrop after its transition completes
  setTimeout(() => {
    backdrop.classList.add("hidden");
  }, 300); // Match transition duration
};

// Setup general modal listeners (e.g., for closing the view candidates modal)
export const setupModalListeners = () => {
  document
    .getElementById("btn-close-requirement-candidates-modal")
    ?.addEventListener("click", () => {
      closeModal();
    });
};
