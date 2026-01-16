document.addEventListener("DOMContentLoaded", () => {

  const reportTable = document.getElementById("reportTable");
  const searchInput = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const priorityFilter = document.getElementById("priorityFilter");

  const reports = [
    {
      id: "RPT-1001",
      title: "Pothole on Main Road",
      category: "Road",
      location: "Sector 7",
      priority: "high",
      status: "new",
      date: "2 mins ago"
    },
    {
      id: "RPT-1002",
      title: "Garbage Overflow",
      category: "Sanitation",
      location: "District 4",
      priority: "medium",
      status: "in-progress",
      date: "1 hr ago"
    },
    {
      id: "RPT-1003",
      title: "Street Light Not Working",
      category: "Electricity",
      location: "Ward 12",
      priority: "low",
      status: "resolved",
      date: "Yesterday"
    }
  ];

  function render(data) {
    reportTable.innerHTML = "";

    if (data.length === 0) {
      reportTable.innerHTML =
        `<tr><td colspan="8">No reports found</td></tr>`;
      return;
    }

    data.forEach(r => {
      reportTable.innerHTML += `
        <tr>
          <td>${r.id}</td>
          <td><strong>${r.title}</strong></td>
          <td>${r.category}</td>
          <td>${r.location}</td>
          <td class="priority ${r.priority}">
            ${r.priority.toUpperCase()}
          </td>
          <td class="status ${r.status}">
            ${r.status.replace("-", " ").toUpperCase()}
          </td>
          <td>${r.date}</td>
          <td>
            <button class="action-btn" title="View">
              <span class="material-symbols-outlined">visibility</span>
            </button>
          </td>
        </tr>
      `;
    });
  }

  function applyFilters() {
    let filtered = [...reports];

    const search = searchInput.value.toLowerCase();
    if (search) {
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(search) ||
        r.location.toLowerCase().includes(search)
      );
    }

    if (statusFilter.value !== "all") {
      filtered = filtered.filter(r => r.status === statusFilter.value);
    }

    if (priorityFilter.value !== "all") {
      filtered = filtered.filter(r => r.priority === priorityFilter.value);
    }

    render(filtered);
  }

  searchInput.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);
  priorityFilter.addEventListener("change", applyFilters);

  render(reports);
});
