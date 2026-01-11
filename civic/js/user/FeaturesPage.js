const FEATURES = [
    { id: 1, title: "One-Click Reporting", desc: "Simply take a photo and our AI automatically categorizes and routes your report to the right department.", icon: "📷" },
    { id: 2, title: "AI + GIS Intelligence", desc: "Advanced AI classification combined with GPS mapping to locate, prioritize, and track urban issues effectively.", icon: "📍" },
    { id: 3, title: "Live Status Updates", desc: "Get real-time updates on your reports with transparent tracking, just like delivery apps.", icon: "⏱️" },
    { id: 4, title: "Accountability Dashboard", desc: "Municipal bodies get dashboards with SLA timers, escalation alerts, and performance metrics.", icon: "🛡️" },
    { id: 5, title: "Smart City Integration", desc: "Seamlessly integrates with Smart City infrastructure for scalable urban management.", icon: "📊" },
    { id: 6, title: "Citizen-Centric Design", desc: "Built for every city and town, making civic participation accessible and effective for all citizens.", icon: "👥" }
  ];

  const grid = document.getElementById("featuresGrid");

  FEATURES.forEach(f => {
    const card = document.createElement("div");
    card.className = "feature-card";

    card.innerHTML = `
      <div class="feature-icon">${f.icon}</div>
      <h3 class="feature-title">${f.title}</h3>
      <p class="feature-desc">${f.desc}</p>
    `;

    grid.appendChild(card);
  });