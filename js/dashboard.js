// js/dashboard.js
// This file handles the rendering and logic for the Dashboard section

import { statusMapping, colorPalette } from "./data.js";

let statusChartInstance = null; // To hold the Chart.js instance

/**
 * Renders the dashboard statistics and candidate status chart.
 */
export const renderDashboard = async () => {
  // Added async
  const statActiveRequirementsElem = document.getElementById(
    "stat-active-requirements"
  );
  const statPendingApprovalElem = document.getElementById(
    "stat-pending-approval"
  );
  const statReadyForSubmissionElem = document.getElementById(
    "stat-ready-for-submission"
  );
  const statRejectedElem = document.getElementById("stat-rejected");
  const ctx = document.getElementById("status-chart");

  if (
    !statActiveRequirementsElem ||
    !statPendingApprovalElem ||
    !statReadyForSubmissionElem ||
    !statRejectedElem ||
    !ctx
  ) {
    console.error("Dashboard elements not found.");
    return;
  }

  try {
    // Fetch all requirements from the backend
    const requirementsResponse = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_requirements.php"
    );
    if (!requirementsResponse.ok) {
      throw new Error(`HTTP error! status: ${requirementsResponse.status}`);
    }
    const requirements = await requirementsResponse.json();

    // Fetch all candidates from the backend
    const candidatesResponse = await fetch(
      "http://localhost/CREW-RECRUITMENT-APP/api/get_candidates.php"
    );
    if (!candidatesResponse.ok) {
      throw new Error(`HTTP error! status: ${candidatesResponse.status}`);
    }
    const candidates = await candidatesResponse.json();

    const stats = {
      activeRequirements: requirements.filter(
        (req) =>
          req.status === "Open" &&
          parseInt(req.quantity_filled) < parseInt(req.quantity_required)
      ).length,
      pendingApproval: candidates.filter((candidate) =>
        candidate.status.includes("Pending Approval")
      ).length,
      readyForSubmission: candidates.filter(
        (candidate) => candidate.status === "Ready for Client Submission"
      ).length,
      rejected: candidates.filter((candidate) =>
        candidate.status.includes("Rejected")
      ).length,
    };

    // Update statistic cards
    statActiveRequirementsElem.textContent = stats.activeRequirements;
    statPendingApprovalElem.textContent = stats.pendingApproval;
    statReadyForSubmissionElem.textContent = stats.readyForSubmission;
    statRejectedElem.textContent = stats.rejected;

    // Prepare data for the Doughnut Chart
    const chartData = {
      labels: Object.values(statusMapping).map((s) => s.text),
      datasets: [
        {
          label: "Number of Candidates",
          // Map status keys to count of candidates with that status
          data: Object.keys(statusMapping).map(
            (statusKey) =>
              candidates.filter((candidate) => candidate.status === statusKey)
                .length
          ),
          backgroundColor: Object.values(statusMapping).map((s) => {
            const baseColor = colorPalette[s.color];
            return baseColor ? `${baseColor}B3` : "#ccccccB3"; // Add 70% opacity
          }),
          borderColor: Object.values(statusMapping).map(
            (s) => colorPalette[s.color] || "#cccccc"
          ),
          borderWidth: 1,
        },
      ],
    };

    if (statusChartInstance) {
      // If chart already exists, update its data
      statusChartInstance.data = chartData;
      statusChartInstance.update();
    } else {
      // Otherwise, create a new chart instance
      statusChartInstance = new Chart(ctx, {
        type: "doughnut",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 15,
                font: { size: 12 },
              },
            },
          },
        },
      });
    }
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    // Display error messages on the dashboard if data fetching fails
    statActiveRequirementsElem.textContent = "Error";
    statPendingApprovalElem.textContent = "Error";
    statReadyForSubmissionElem.textContent = "Error";
    statRejectedElem.textContent = "Error";
    // You might want to display a more prominent error message to the user
  }
};
