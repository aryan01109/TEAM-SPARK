export async function getAdminStatistics() {
  // Return a lightweight sample dataset for local dev / build
  return {
    monthlyTrends: [
      { _id: { month: 7, year: 2025 }, count: 12 },
      { _id: { month: 8, year: 2025 }, count: 22 },
      { _id: { month: 9, year: 2025 }, count: 18 }
    ],
    issuesByStatus: { pending: 34, resolved: 280 },
    topDepartments: [{ _id: 'Public Works', count: 120 }, { _id: 'Parks', count: 45 }],
    departmentPriorityStats: [],
    issuesByPriority: { high: 20, medium: 100, low: 200, critical: 3 },
    totals: { issues: 320 },
    avgResponseTime: '2.7 days',
    resolutionRate: '84%',
    citizenSatisfaction: '4.3 / 5',
    resolvedToday: 7
  };
}

export async function getIssues(opts = {}) {
  const sample = [
    { _id: 'ISSUE-001', title: '[Feedback] Pothole on 5th', department: 'Public Works', status: 'pending', submittedDate: new Date().toISOString(), tags: ['feedback'], citizenRating: 4 },
    { _id: 'ISSUE-002', title: 'Streetlight out', department: 'Public Works', status: 'in-progress', submittedDate: new Date().toISOString(), tags: [] }
  ];

  return { data: sample.slice(0, opts.limit || sample.length) };
}

export async function getDepartments() {
  return [
    { _id: 'public-works', name: 'Public Works', issueCount: 12 },
    { _id: 'parks', name: 'Parks', issueCount: 5 },
    { _id: 'utilities', name: 'Utilities', issueCount: 8 }
  ];
}

export async function getUserStatistics() {
  return { totals: { issues: 12 } };
}
