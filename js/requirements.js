// js/requirements.js
// This file handles the rendering and logic for the Crew Requirements section

// No longer importing mockData directly for requirements
import { getStatusBadge } from "./data.js";
import { sortData } from "./utils.js"; // Import utility for sorting

// Global state for filters and sorting specific to Crew Requirements
let currentRequirementFilters = { status: "All", position: "All" };
let currentRequirementSort = { key: "client", order: "asc" }; // Default sort

/**
 * Renders the Crew Requirements table based on current filters and sort order.
 */
export const renderRequirementsTable = async () => {
  // Added async
  const tableBody = document.getElementById("requirements-table-body");
  if (!tableBody) return;

  try {
    // Fetch all requirements from the backend
    const response = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_requirements.php"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const requirements = await response.json();

    let filteredData = requirements; // Use data from server

    // Apply filters
    if (currentRequirementFilters.status !== "All") {
      filteredData = filteredData.filter(
        (req) => req.status === currentRequirementFilters.status
      );
    }
    if (currentRequirementFilters.position !== "All") {
      filteredData = filteredData.filter(
        (req) => req.position === currentRequirementFilters.position
      );
    }

    // Apply sorting
    const sortedData = sortData(
      filteredData,
      currentRequirementSort.key,
      currentRequirementSort.order
    );

    tableBody.innerHTML = sortedData
      .map(
        (req) => `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${
                  req.client
                }</td>
                <td class="px-6 py-4">${req.position}</td>
                <td class="px-6 py-4">${req.quantity_required}</td>
                <td class="px-6 py-4">${req.quantity_filled}</td>
                <td class="px-6 py-4">${new Date(
                  req.date_needed
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</td>
                <td class="px-6 py-4">${
                  req.status === "Open"
                    ? '<span class="status-badge status-green">Open</span>'
                    : '<span class="status-badge status-gray">Filled</span>'
                }</td>
                <td class="px-6 py-4 text-center">
                    <button data-id="${
                      req.id
                    }" class="btn-view-requirement-candidates text-blue-500 hover:text-blue-700 transition p-1 rounded-full hover:bg-blue-100" title="View Candidates">👁️</button>
                </td>
                <td class="px-6 py-4 text-center">
                    <button data-id="${
                      req.id
                    }" class="btn-delete-requirement text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-100">🗑️</button>
                </td>
            </tr>
        `
      )
      .join("");

    // Update sort indicators on table headers
    document
      .querySelectorAll("#requirements-section .sortable-header")
      .forEach((header) => {
        header.classList.remove("asc", "desc");
        if (header.dataset.sortKey === currentRequirementSort.key) {
          header.classList.add(currentRequirementSort.order);
        }
      });
  } catch (error) {
    console.error("Error fetching requirements:", error);
    tableBody.innerHTML =
      '<tr><td colspan="8" class="px-6 py-4 text-center text-red-500">Error loading requirements. Please check server connection.</td></tr>';
  }
};

/**
 * Deletes a crew requirement from the database.
 * @param {string} id - The ID of the requirement to delete.
 */
const deleteRequirement = async (id) => {
  // Added async
  const parsedId = parseInt(id);
  if (confirm("Are you sure you want to delete this requirement?")) {
    try {
      const response = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/delete_requirement.php",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: parsedId }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (result.success) {
        window.renderAll(); // Re-render all sections after successful delete
      } else {
        console.error("Failed to delete requirement:", result.message);
        alert("Failed to delete requirement: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting requirement:", error);
      alert("An error occurred while deleting the requirement.");
    }
  }
};

/**
 * Displays a modal with candidates linked to a specific crew requirement.
 * @param {string} requirementId - The ID of the crew requirement.
 */
const viewRequirementCandidates = async (requirementId) => {
  // Added async
  try {
    const requirementResponse = await fetch(
      `http://localhost/CREW-RECRUITMENT-APP/api/get_requirement_by_id.php?id=${requirementId}`
    );
    if (!requirementResponse.ok) {
      throw new Error(`HTTP error! status: ${requirementResponse.status}`);
    }
    const requirement = await requirementResponse.json();

    if (!requirement) {
      console.error("Requirement not found:", requirementId);
      return;
    }

    document.getElementById("requirement-modal-title-position").textContent =
      requirement.position;
    document.getElementById("requirement-modal-title-client").textContent =
      requirement.client;

    // Fetch candidates specifically for this requirement
    const candidatesResponse = await fetch(
      `http://localhost/CREW-RECRUITMENT-APP/api/get_candidates_by_requirement_id.php?requirement_id=${requirementId}`
    );
    if (!candidatesResponse.ok) {
      throw new Error(`HTTP error! status: ${candidatesResponse.status}`);
    }
    const candidatesForRequirement = await candidatesResponse.json();

    const tableBody = document.getElementById(
      "requirement-candidates-table-body"
    );

    if (candidatesForRequirement.length > 0) {
      tableBody.innerHTML = candidatesForRequirement
        .map(
          (candidate) => `
                <tr class="bg-white border-b hover:bg-gray-50">
                    <td class="px-6 py-4 font-medium text-gray-900">${
                      candidate.name
                    }</td>
                    <td class="px-6 py-4">${candidate.position}</td>
                    <td class="px-6 py-4">${getStatusBadge(
                      candidate.status
                    )}</td>
                </tr>
            `
        )
        .join("");
    } else {
      tableBody.innerHTML =
        '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">No candidates linked to this requirement.</td></tr>';
    }

    window.openModal("modal-view-requirement-candidates");
  } catch (error) {
    console.error("Error viewing requirement candidates:", error);
    alert("An error occurred while loading candidates for this requirement.");
  }
};

/**
 * Sets up event listeners for the Crew Requirements section.
 * @param {function} renderAllCallback - Callback to re-render all app sections.
 * @param {function} openModalCallback - Callback to open a modal.
 * @param {function} closeModalCallback - Callback to close a modal.
 */
export const setupRequirementsListeners = (
  renderAllCallback,
  openModalCallback,
  closeModalCallback
) => {
  const filterRequirementStatus = document.getElementById(
    "filter-requirement-status"
  );
  const filterRequirementPosition = document.getElementById(
    "filter-requirement-position"
  );
  const requirementSortableHeaders = document.querySelectorAll(
    "#requirements-section .sortable-header"
  );
  const btnAddRequirement = document.getElementById("btn-add-requirement");
  const btnCancelRequirement = document.getElementById(
    "btn-cancel-requirement"
  );
  const formAddRequirement = document.getElementById("form-add-requirement");

  // Populate unique positions for the position filter dropdown
  // This will fetch live positions from the database
  const populatePositionFilter = async () => {
    try {
      const response = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/get_requirements.php"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const requirements = await response.json();
      const uniqueRequirementPositions = [
        ...new Set(requirements.map((req) => req.position)),
      ].sort();
      filterRequirementPosition.innerHTML = '<option value="All">All</option>'; // Clear existing and add "All" option
      uniqueRequirementPositions.forEach((pos) => {
        const option = document.createElement("option");
        option.value = pos;
        option.textContent = pos;
        filterRequirementPosition.appendChild(option);
      });
    } catch (error) {
      console.error("Error populating position filter:", error);
    }
  };
  populatePositionFilter(); // Call on setup

  // Event listeners for filters
  filterRequirementStatus?.addEventListener("change", () => {
    currentRequirementFilters.status = filterRequirementStatus.value;
    renderRequirementsTable(); // Re-render table with new filter
  });
  filterRequirementPosition?.addEventListener("change", () => {
    currentRequirementFilters.position = filterRequirementPosition.value;
    renderRequirementsTable(); // Re-render table with new filter
  });

  // Event listeners for sortable headers
  requirementSortableHeaders.forEach((header) => {
    header.addEventListener("click", (e) => {
      const sortKey = e.currentTarget.dataset.sortKey;
      if (currentRequirementSort.key === sortKey) {
        // If same column, toggle sort order
        currentRequirementSort.order =
          currentRequirementSort.order === "asc" ? "desc" : "asc";
      } else {
        // If new column, set as primary sort key and default to ascending
        currentRequirementSort.key = sortKey;
        currentRequirementSort.order = "asc";
      }
      renderRequirementsTable(); // Re-render table with new sort order
    });
  });

  // Event listeners for "Add Requirement" modal
  btnAddRequirement?.addEventListener("click", () => {
    openModalCallback("modal-add-requirement");
  });
  btnCancelRequirement?.addEventListener("click", () => {
    closeModalCallback();
    formAddRequirement.reset(); // Reset form fields on cancel
  });
  formAddRequirement?.addEventListener("submit", async (e) => {
    // Added async
    e.preventDefault();
    const form = e.target;
    const newRequirement = {
      client: form["client"].value,
      position: form["position"].value,
      quantity_required: parseInt(form["quantityRequired"].value),
      date_needed: form["dateNeeded"].value,
      // quantity_filled and status will be set in the backend
    };

    try {
      const response = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/add_requirement.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRequirement),
        }
      );
      const result = await response.json();

      if (result.success) {
        alert("Requirement added successfully!"); // Replace with custom modal if not desired
        renderAllCallback(); // Re-render all app content
        closeModalCallback();
        form.reset();
        populatePositionFilter(); // Re-populate filter options after adding new position
      } else {
        console.error("Failed to add requirement:", result.message);
        alert("Failed to add requirement: " + result.message);
      }
    } catch (error) {
      console.error("Error adding requirement:", error);
      alert("An error occurred while adding the requirement.");
    }
  });

  // Event delegation for dynamically added buttons (delete and view candidates)
  document
    .getElementById("requirements-table-body")
    ?.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-delete-requirement")) {
        deleteRequirement(e.target.dataset.id);
      } else if (
        e.target.classList.contains("btn-view-requirement-candidates")
      ) {
        viewRequirementCandidates(e.target.dataset.id);
      }
    });
};
