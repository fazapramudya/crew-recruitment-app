// js/approvals.js
// This file handles the rendering and logic for the Approval Process section

// No longer importing mockData directly for candidates and requirements
import { getStatusBadge } from "./data.js";

/**
 * Renders the lists of candidates awaiting approval by Lead of Selection and Crew Manager.
 */
export const renderApprovalLists = async () => {
  // Added async
  const leadList = document.getElementById("approval-lead-list");
  const managerList = document.getElementById("approval-manager-list");
  if (!leadList || !managerList) return;

  try {
    // Fetch all candidates from the backend
    const response = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_candidates.php"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const candidates = await response.json();

    // Fetch all requirements from the backend to link candidates
    const reqResponse = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_requirements.php"
    );
    if (!reqResponse.ok) {
      throw new Error(`HTTP error! status: ${reqResponse.status}`);
    }
    const requirements = await reqResponse.json();

    // Filter candidates based on their approval status
    const waitingLead = candidates.filter(
      (candidate) => candidate.status === "Pending Approval (Lead of Selection)"
    );
    const waitingManager = candidates.filter(
      (candidate) => candidate.status === "Pending Approval (Crew Manager)"
    );

    // Render cards for each list, or a message if no candidates are awaiting approval
    leadList.innerHTML =
      waitingLead.length > 0
        ? waitingLead
            .map((candidate) => createApprovalCard(candidate, requirements))
            .join("")
        : '<p class="text-gray-500">No candidates awaiting approval.</p>';
    managerList.innerHTML =
      waitingManager.length > 0
        ? waitingManager
            .map((candidate) => createApprovalCard(candidate, requirements))
            .join("")
        : '<p class="text-gray-500">No candidates awaiting approval.</p>';
  } catch (error) {
    console.error("Error fetching approval lists:", error);
    leadList.innerHTML =
      '<p class="text-red-500">Error loading approval list.</p>';
    managerList.innerHTML =
      '<p class="text-red-500">Error loading approval list.</p>';
  }
};

/**
 * Creates an HTML card for a candidate awaiting approval.
 * @param {object} candidate - The candidate object.
 * @param {Array} requirements - Array of all requirements to find linked one.
 * @returns {string} The HTML string for the approval card.
 */
const createApprovalCard = (candidate, requirements) => {
  // Find the linked requirement for display purposes
  const requirement = requirements.find(
    (req) => req.id === candidate.requirement_id
  ); // Note: requirement_id from DB
  // Determine the role for approval (Lead or Manager) based on current status
  const role = candidate.status.includes("Lead") ? "Lead" : "Manager";
  return `
        <div class="bg-white p-4 rounded-lg shadow-md k-card border-yellow-400">
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-gray-800">${candidate.name}</p>
                    <p class="text-sm text-gray-600">${
                      requirement
                        ? candidate.position + " for " + requirement.client
                        : candidate.position + " (Not Linked)"
                    }</p>
                </div>
                ${getStatusBadge(candidate.status)}
            </div>
            <div class="mt-4 flex space-x-2">
                <button data-id="${
                  candidate.id
                }" data-role="${role}" class="btn-approve text-sm bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-lg transition">Approve</button>
                <button data-id="${
                  candidate.id
                }" data-role="${role}" class="btn-reject text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition">Reject</button>
            </div>
        </div>
    `;
};

/**
 * Handles the approval or rejection of a candidate.
 * @param {string} candidateId - The ID of the candidate.
 * @param {string} role - The role performing the approval ('Lead' or 'Manager').
 * @param {boolean} isApproved - True if approved, false if rejected.
 * @param {string} [reason='Approved'] - The reason for rejection (if applicable).
 */
const handleApproval = async (
  candidateId,
  role,
  isApproved,
  reason = "Approved"
) => {
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
      console.error("Candidate not found for approval:", candidateId);
      return;
    }

    let newStatus;
    let newHistory = JSON.parse(candidate.history || "[]"); // Parse history from DB (might be stringified JSON)

    if (role === "Lead") {
      newStatus = isApproved
        ? "Pending Approval (Crew Manager)"
        : "Rejected by Lead of Selection";
      newHistory.push({
        status: newStatus,
        by: "Lead of Selection",
        note: reason,
      });
    } else if (role === "Manager") {
      newStatus = isApproved
        ? "Ready for Client Submission"
        : "Rejected by Crew Manager";
      newHistory.push({ status: newStatus, by: "Crew Manager", note: reason });
    }

    // Prepare data for update
    const updateData = {
      id: parseInt(candidateId),
      status: newStatus,
      history: JSON.stringify(newHistory), // Stringify history back to JSON for DB
    };

    // Send update request to backend
    const updateResponse = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/update_candidate.php",
      {
        method: "PUT", // Use PUT for updates
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
      // If approved and status is 'Ready for Client Submission', update requirement quantity if linked
      // This part is for 'Mark as Placed' logic, which is handled in candidates.js.
      // For approval, we just update candidate status.
      window.renderAll(); // Re-render all sections after successful update
    } else {
      console.error("Failed to update candidate status:", result.message);
      alert("Failed to update candidate status: " + result.message);
    }
  } catch (error) {
    console.error("Error handling approval:", error);
    alert("An error occurred during approval process.");
  }
};

/**
 * Sets up event listeners for the Approval Process section.
 * @param {function} renderAllCallback - Callback to re-render all app sections.
 */
export const setupApprovalListeners = (renderAllCallback) => {
  // Event delegation for dynamically added approve/reject buttons
  document
    .getElementById("approval-lead-list")
    ?.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-approve")) {
        handleApproval(e.target.dataset.id, e.target.dataset.role, true);
      } else if (e.target.classList.contains("btn-reject")) {
        const reason = prompt(
          `Please provide a reason for rejection for this candidate:`
        );
        if (reason) {
          handleApproval(
            e.target.dataset.id,
            e.target.dataset.role,
            false,
            reason
          );
        }
      }
    });

  document
    .getElementById("approval-manager-list")
    ?.addEventListener("click", (e) => {
      if (e.target.classList.contains("btn-approve")) {
        handleApproval(e.target.dataset.id, e.target.dataset.role, true);
      } else if (e.target.classList.contains("btn-reject")) {
        const reason = prompt(
          `Please provide a reason for rejection for this candidate:`
        );
        if (reason) {
          handleApproval(
            e.target.dataset.id,
            e.target.dataset.role,
            false,
            reason
          );
        }
      }
    });
};
