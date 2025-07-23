// js/candidates.js
// This file handles the rendering and logic for the Candidate Database section

// No longer importing mockData directly for candidates
import { statusMapping, getStatusBadge } from "./data.js";
import { sortData } from "./utils.js"; // Import utility for sorting
import { openModal, closeModal } from "./modals.js"; // Import modal functions

// Global state for filters and sorting specific to Candidate Database
let currentCandidateFilters = { searchText: "", status: "All" };
let currentCandidateSort = { key: "name", order: "asc" }; // Default sort

/**
 * Renders the Candidate Database table based on current filters and sort order.
 */
export const renderCandidatesTable = async () => {
  // Added async
  const tableBody = document.getElementById("candidates-table-body");
  if (!tableBody) return;

  try {
    // Fetch all candidates from the backend
    const candidatesResponse = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_candidates.php"
    );
    if (!candidatesResponse.ok) {
      throw new Error(`HTTP error! status: ${candidatesResponse.status}`);
    }
    const candidates = await candidatesResponse.json();

    // Fetch all requirements from the backend to link candidates
    const requirementsResponse = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_requirements.php"
    );
    if (!requirementsResponse.ok) {
      throw new Error(`HTTP error! status: ${requirementsResponse.status}`);
    }
    const requirements = await requirementsResponse.json();

    let filteredData = candidates; // Use data from server

    // Apply text filter (search by name or position)
    if (currentCandidateFilters.searchText) {
      filteredData = filteredData.filter(
        (candidate) =>
          candidate.name
            .toLowerCase()
            .includes(currentCandidateFilters.searchText.toLowerCase()) ||
          candidate.position
            .toLowerCase()
            .includes(currentCandidateFilters.searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (currentCandidateFilters.status !== "All") {
      filteredData = filteredData.filter(
        (candidate) => candidate.status === currentCandidateFilters.status
      );
    }

    // Apply sorting
    const sortedData = sortData(
      filteredData,
      currentCandidateSort.key,
      currentCandidateSort.order
    );

    tableBody.innerHTML = sortedData
      .map((candidate) => {
        // Find the linked requirement to display its details
        const linkedRequirement = requirements.find(
          (req) => req.id === candidate.requirement_id
        ); // Note: requirement_id from DB
        const linkedRequirementText = linkedRequirement
          ? `${linkedRequirement.position} (${linkedRequirement.client})`
          : "Not Linked"; // Display 'Not Linked' if no requirement is associated

        return `
            <tr class="bg-white border-b hover:bg-gray-50">
                <td class="px-6 py-4 font-medium text-gray-900">${
                  candidate.name
                }</td>
                <td class="px-6 py-4">${candidate.position}</td>
                <td class="px-6 py-4">${candidate.experience}</td>
                <td class="px-6 py-4">${getStatusBadge(candidate.status)}</td>
                <td class="px-6 py-4">${linkedRequirementText}</td>
                <td class="px-6 py-4 flex space-x-2">
                    ${
                      candidate.status === "Draft" ||
                      candidate.status.includes("Rejected")
                        ? // Show "Request Approval" button if candidate is in Draft or Rejected status
                          `<button data-id="${candidate.id}" class="btn-request-approval text-sm bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-3 rounded-lg transition">Request Approval</button>`
                        : candidate.status === "Ready for Client Submission"
                        ? // Show "Mark as Placed" button if candidate is ready for submission
                          `<button data-id="${candidate.id}" class="btn-mark-as-placed text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg transition">Mark as Placed</button>`
                        : // Otherwise, show an empty span
                          `<span class="text-gray-500 text-sm"></span>`
                    }
                </td>
                <td class="px-6 py-4 text-center">
                    <button data-id="${
                      candidate.id
                    }" class="btn-delete-candidate text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-100">🗑️</button>
                </td>
            </tr>
        `;
      })
      .join("");

    // Update sort indicators on table headers
    document
      .querySelectorAll("#candidates-section .sortable-header")
      .forEach((header) => {
        header.classList.remove("asc", "desc");
        if (header.dataset.sortKey === currentCandidateSort.key) {
          header.classList.add(currentCandidateSort.order);
        }
      });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    tableBody.innerHTML =
      '<tr><td colspan="7" class="px-6 py-4 text-center text-red-500">Error loading candidates. Please check server connection.</td></tr>';
  }
};

/**
 * Initiates the approval process for a candidate.
 * @param {string} candidateId - The ID of the candidate to request approval for.
 */
const requestApproval = async (candidateId) => {
  // Added async
  console.log("requestApproval called for candidateId:", candidateId);
  try {
    // First, get the current candidate data to update its history
    const getResponse = await fetch(
      `http://localhost/CREW-RECRUITMENT-APP/api/get_candidate_by_id.php?id=${candidateId}`
    );
    console.log("Response object from get_candidate_by_id.php:", getResponse);

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error(
        `HTTP error! status: ${getResponse.status}. Details: ${errorText}`
      );
      throw new Error(
        `HTTP error! status: ${getResponse.status}. Details: ${errorText}`
      );
    }

    const rawResponseText = await getResponse.text();
    console.log(
      "Raw response text from get_candidate_by_id.php:",
      rawResponseText
    ); // Log raw response

    let candidate;
    try {
      candidate = JSON.parse(rawResponseText); // Attempt to parse JSON
      console.log("Parsed candidate data:", candidate);
    } catch (jsonError) {
      console.error(
        "JSON parsing error for get_candidate_by_id.php response:",
        jsonError
      );
      throw new Error("Invalid JSON response from server for candidate data.");
    }

    if (!candidate || Object.keys(candidate).length === 0) {
      // Check if candidate is null or empty object
      console.error(
        "Candidate not found or empty data for approval request:",
        candidateId
      );
      alert("Candidate not found for approval request."); // More user-friendly message
      return;
    }

    console.log("Candidate status retrieved from DB:", candidate.status); // Log the actual status
    console.log("Checking eligibility for approval request...");
    console.log("Is status 'Draft'?", candidate.status === "Draft");
    console.log(
      "Does status include 'Rejected'?",
      candidate.status.includes("Rejected")
    );

    if (candidate.status === "Draft" || candidate.status.includes("Rejected")) {
      console.log(
        "Candidate is eligible for approval request. Proceeding with update."
      );
      const newStatus = "Pending Approval (Lead of Selection)";
      let newHistory = JSON.parse(candidate.history || "[]"); // Parse history from DB (might be stringified JSON)
      newHistory.push({
        status: newStatus,
        by: "Selection Team",
        note: "Submitted for approval.",
      });

      const updateData = {
        id: parseInt(candidateId),
        status: newStatus,
        history: JSON.stringify(newHistory), // Stringify history back to JSON for DB
      };
      console.log("Data to be sent to update_candidate.php:", updateData);

      const updateResponse = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/update_candidate.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
      console.log("Response object from update_candidate.php:", updateResponse);

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error(
          `HTTP error! status: ${updateResponse.status}. Details: ${errorText}`
        );
        throw new Error(
          `HTTP error! status: ${updateResponse.status}. Details: ${errorText}`
        );
      }

      const rawUpdateResponseText = await updateResponse.text();
      console.log(
        "Raw response from update_candidate.php:",
        rawUpdateResponseText
      ); // Log raw update response

      let result;
      try {
        result = JSON.parse(rawUpdateResponseText);
        console.log("Parsed result from update_candidate.php:", result);
      } catch (jsonError) {
        console.error(
          "JSON parsing error for update_candidate.php response:",
          jsonError
        );
        throw new Error(
          "Invalid JSON response from server for update operation."
        );
      }

      if (result.success) {
        alert("Candidate status updated successfully!"); // More specific success message
        window.renderAll(); // Re-render all sections after successful update
      } else {
        console.error("Failed to request approval:", result.message);
        alert("Failed to request approval: " + result.message);
      }
    } else {
      console.log(
        "Candidate status is not 'Draft' or 'Rejected'. No approval request initiated."
      );
      alert("Candidate status is not eligible for approval request.");
    }
  } catch (error) {
    console.error("Error requesting approval:", error);
    alert(
      "An error occurred while requesting approval. Check console for details."
    );
  }
};

/**
 * Marks a candidate as "Placed" and updates the linked requirement.
 * @param {string} candidateId - The ID of the candidate to mark as placed.
 */
const markAsPlaced = async (candidateId) => {
  // Added async
  try {
    // First, get the current candidate data to update its history
    const getResponse = await fetch(
      `http://localhost/CREW-RECRUITMENT-APP/api/get_candidate_by_id.php?id=${candidateId}`
    );
    if (!getResponse.ok) {
      throw new Error(`HTTP error! status: ${getResponse.status}`);
    }
    const candidate = await getResponse.json();

    if (!candidate) {
      console.error("Candidate not found for marking as placed:", candidateId);
      return;
    }

    if (candidate.status === "Ready for Client Submission") {
      const newStatus = "Placed";
      let newHistory = JSON.parse(candidate.history || "[]"); // Parse history from DB
      newHistory.push({
        status: newStatus,
        by: "System",
        note: "Candidate placed.",
      });

      const updateData = {
        id: parseInt(candidateId),
        status: newStatus,
        history: JSON.stringify(newHistory), // Stringify history back to JSON for DB
      };

      const updateResponse = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/update_candidate.php",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }
      const result = await updateResponse.json();

      if (result.success) {
        // If the candidate is linked to a requirement, update its filled quantity and status
        if (candidate.requirement_id) {
          // Note: requirement_id from DB
          const reqId = candidate.requirement_id;
          const reqUpdateResponse = await fetch(
            `http://localhost/CREW-RECRUITMENT-APP/api/get_requirement_by_id.php?id=${reqId}`
          );
          if (reqUpdateResponse.ok) {
            const requirement = await reqUpdateResponse.json();
            if (requirement) {
              const updatedQuantityFilled =
                (parseInt(requirement.quantity_filled) || 0) + 1;
              let updatedReqStatus = requirement.status;
              if (
                updatedQuantityFilled >= parseInt(requirement.quantity_required)
              ) {
                updatedReqStatus = "Filled";
              }
              await fetch(
                "http://localhost/CREW-RECRUITMENT-APP/api/update_requirement.php",
                {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    id: reqId,
                    quantity_filled: updatedQuantityFilled,
                    status: updatedReqStatus,
                  }),
                }
              );
            }
          }
        }
        window.renderAll(); // Re-render all sections after successful update
      } else {
        console.error("Failed to mark as placed:", result.message);
        alert("Failed to mark as placed: " + result.message);
      }
    }
  } catch (error) {
    console.error("Error marking as placed:", error);
    alert("An error occurred while marking as placed.");
  }
};

/**
 * Deletes a candidate from the database.
 * @param {string} id - The ID of the candidate to delete.
 */
const deleteCandidate = async (id) => {
  // Added async
  const parsedId = parseInt(id);
  if (confirm("Are you sure you want to delete this candidate?")) {
    try {
      const response = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/delete_candidate.php",
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
        console.error("Failed to delete candidate:", result.message);
        alert("Failed to delete candidate: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
      alert("An error occurred while deleting the candidate.");
    }
  }
};

/**
 * Sets up event listeners for the Candidate Database section.
 * @param {function} renderAllCallback - Callback to re-render all app sections.
 * @param {function} openModalCallback - Callback to open a modal.
 * @param {function} closeModalCallback - Callback to close a modal.
 */
export const setupCandidatesListeners = (
  renderAllCallback,
  openModalCallback,
  closeModalCallback
) => {
  const filterCandidateText = document.getElementById("filter-candidate-text");
  const filterCandidateStatus = document.getElementById(
    "filter-candidate-status"
  );
  const candidateSortableHeaders = document.querySelectorAll(
    "#candidates-section .sortable-header"
  );
  const btnAddCandidate = document.getElementById("btn-add-candidate");
  const btnCancelCandidate = document.getElementById("btn-cancel-candidate");
  const formAddCandidate = document.getElementById("form-add-candidate");

  // Populate unique statuses for the status filter dropdown dynamically from statusMapping
  // This ensures consistency with defined statuses and avoids fetching all candidates just for filter options.
  filterCandidateStatus.innerHTML = '<option value="All">All</option>'; // Clear existing and add "All" option
  Object.keys(statusMapping)
    .sort()
    .forEach((statusKey) => {
      // Iterate through keys of statusMapping
      const option = document.createElement("option");
      option.value = statusKey; // Use the actual status key as value
      option.textContent = statusMapping[statusKey].text; // Use the display text
      filterCandidateStatus.appendChild(option);
    });

  // Event listeners for filters
  filterCandidateText?.addEventListener("input", (e) => {
    currentCandidateFilters.searchText = e.target.value;
    renderCandidatesTable(); // Re-render table with new filter
  });
  filterCandidateStatus?.addEventListener("change", (e) => {
    currentCandidateFilters.status = e.target.value;
    renderCandidatesTable(); // Re-render table with new filter
  });

  // Event listeners for sortable headers
  candidateSortableHeaders.forEach((header) => {
    header.addEventListener("click", (e) => {
      const sortKey = e.currentTarget.dataset.sortKey;
      if (currentCandidateSort.key === sortKey) {
        // If same column, toggle sort order
        currentCandidateSort.order =
          currentCandidateSort.order === "asc" ? "desc" : "asc";
      } else {
        // If new column, set as primary sort key and default to ascending
        currentCandidateSort.key = sortKey;
        currentCandidateSort.order = "asc";
      }
      renderCandidatesTable(); // Re-render table with new sort order
    });
  });

  // Event listeners for "Add Candidate" modal
  btnAddCandidate?.addEventListener("click", async () => {
    // Added async
    const requirementSelect = document.getElementById("candidate-requirement");
    requirementSelect.innerHTML =
      '<option value="">-- Select Requirement --</option>'; // Clear existing options

    try {
      // Fetch open requirements from backend to populate dropdown
      const response = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/get_requirements.php"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const requirements = await response.json();

      requirements
        .filter((req) => req.status === "Open")
        .forEach((req) => {
          const option = document.createElement("option");
          option.value = req.id;
          option.textContent = `${req.position} (${req.client}) - Required: ${
            req.quantity_required - req.quantity_filled
          }`; // Note: quantity_required, quantity_filled from DB
          requirementSelect.appendChild(option);
        });
    } catch (error) {
      console.error(
        "Error populating requirements for candidate modal:",
        error
      );
      // Optionally, display an error message in the modal
    }
    openModalCallback("modal-add-candidate");
  });

  btnCancelCandidate?.addEventListener("click", () => {
    closeModalCallback();
    formAddCandidate.reset(); // Reset form fields on cancel
  });

  formAddCandidate?.addEventListener("submit", async (e) => {
    // Added async
    e.preventDefault();
    const form = e.target;
    const requirementId = form["requirementId"].value
      ? parseInt(form["requirementId"].value)
      : null;
    const newCandidateData = {
      name: form["name"].value,
      position: form["position"].value,
      experience: form["experience"].value,
      status: "Draft", // Default status for new candidate
      requirement_id: requirementId, // Note: requirement_id for DB
      history: JSON.stringify([]), // Initialize history as empty JSON string
    };

    try {
      const response = await fetch(
        "http://localhost/CREW-RECRUITMENT-APP/api/add_candidate.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newCandidateData),
        }
      );
      const result = await response.json();

      if (result.success) {
        alert("Candidate added successfully!"); // Ganti dengan modal custom jika tidak ingin alert
        renderAllCallback(); // Re-render all app content
        closeModalCallback();
        form.reset();
      } else {
        console.error("Failed to add candidate:", result.message);
        alert("Failed to add candidate: " + result.message);
      }
    } catch (error) {
      console.error("Error adding candidate:", error);
      alert("An error occurred while adding the candidate.");
    }
  });

  // Event delegation for action buttons within the table (Request Approval, Mark as Placed, Delete)
  document
    .getElementById("candidates-table-body")
    ?.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-request-approval")) {
        requestApproval(e.target.dataset.id);
      } else if (e.target.classList.contains("btn-mark-as-placed")) {
        markAsPlaced(e.target.dataset.id);
      } else if (e.target.classList.contains("btn-delete-candidate")) {
        deleteCandidate(e.target.dataset.id);
      }
    });
};
