// js/data.js
// This file holds the mock data and common mappings/constants

export const mockData = {
  requirements: [
    {
      id: 1,
      client: "PT Pelayaran Jaya",
      position: "Captain",
      quantityRequired: 1,
      quantityFilled: 1,
      dateNeeded: "2025-08-01",
      status: "Filled",
    },
    {
      id: 2,
      client: "Samudera Logistik",
      position: "Chief Engineer",
      quantityRequired: 1,
      quantityFilled: 0,
      dateNeeded: "2025-08-15",
      status: "Open",
    },
    {
      id: 3,
      client: "PT Bahari Sejahtera",
      position: "Able Seaman",
      quantityRequired: 2,
      quantityFilled: 0,
      dateNeeded: "2025-09-01",
      status: "Open",
    },
    {
      id: 4,
      client: "Samudera Logistik",
      position: "Oiler",
      quantityRequired: 3,
      quantityFilled: 0,
      dateNeeded: "2025-08-20",
      status: "Open",
    },
  ],
  candidates: [
    {
      id: 101,
      name: "Ahmad Subarjo",
      position: "Captain",
      experience: "10 years",
      status: "Placed",
      requirementId: 1,
      history: [
        {
          status: "Ready for Client Submission",
          by: "Crew Manager",
          note: "Approved",
        },
        { status: "Placed", by: "System", note: "Candidate placed." },
      ],
    },
    {
      id: 102,
      name: "Budi Santoso",
      position: "Chief Engineer",
      experience: "8 years",
      status: "Pending Approval (Crew Manager)",
      requirementId: 2,
      history: [
        {
          status: "Pending Approval (Crew Manager)",
          by: "Lead of Selection",
          note: "Excellent qualifications.",
        },
      ],
    },
    {
      id: 103,
      name: "Citra Lestari",
      position: "Able Seaman",
      experience: "4 years",
      status: "Pending Approval (Lead of Selection)",
      requirementId: 3,
      history: [],
    },
    {
      id: 104,
      name: "Doni Firmansyah",
      position: "Able Seaman",
      experience: "5 years",
      status: "Rejected by Lead of Selection",
      requirementId: 3,
      history: [
        {
          status: "Rejected by Lead of Selection",
          by: "Lead of Selection",
          note: "BST certificate expired.",
        },
      ],
    },
    {
      id: 105,
      name: "Eka Wijaya",
      position: "Oiler",
      experience: "2 years",
      status: "Draft",
      requirementId: null,
      history: [],
    },
    {
      id: 106,
      name: "Fajar Nugraha",
      position: "Oiler",
      experience: "3 years",
      status: "Ready for Client Submission",
      requirementId: 4,
      history: [
        {
          status: "Ready for Client Submission",
          by: "Crew Manager",
          note: "Approved",
        },
      ],
    },
  ],
};

export const statusMapping = {
  Draft: { text: "Draft", color: "gray" },
  "Pending Approval (Lead of Selection)": {
    text: "Pending (Lead)",
    color: "yellow",
  },
  "Rejected by Lead of Selection": { text: "Rejected (Lead)", color: "red" },
  "Pending Approval (Crew Manager)": {
    text: "Pending (Manager)",
    color: "yellow",
  },
  "Rejected by Crew Manager": { text: "Rejected (Manager)", color: "red" },
  "Ready for Client Submission": { text: "Ready for Client", color: "purple" },
  Placed: { text: "Placed", color: "green" },
};

// Define color palette directly in JS to avoid getComputedStyle errors on initial load
export const colorPalette = {
  blue: "#3b82f6",
  yellow: "#ca8a04",
  red: "#ef4444",
  green: "#22c55e",
  gray: "#6b7280",
  purple: "#8b5cf6",
};

// Helper function to get status badge HTML
export const getStatusBadge = (status) => {
  const mapping = statusMapping[status] || { text: status, color: "gray" };
  return `<span class="status-badge status-${mapping.color}">${mapping.text}</span>`;
};
