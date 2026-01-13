/* =========================================================
   GLOBAL NAV STATE (Header + Mobile + Scroll Spy)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const headerTabs = document.querySelectorAll(".tab");
  const mobileTabs = document.querySelectorAll(".mobile-tab");
  const glider = document.querySelector(".glider");

  /* -----------------------------------------
     ROUTE CONFIG
  ----------------------------------------- */
  const routes = [
    { key: "dashboard", path: "/dashboard", hash: "#dashboard" },
    { key: "report", path: "/report", hash: "#report" },
    { key: "my-reports", path: "/my-reports", hash: "#my-reports" },
    { key: "community", path: "/community", hash: "#community" }
  ];

  /* -----------------------------------------
     HELPERS
  ----------------------------------------- */
  function clearActive() {
    headerTabs.forEach(t => {
      t.classList.remove("active");
      t.setAttribute("aria-selected", "false");
    });

    mobileTabs.forEach(t => t.classList.remove("active"));
  }

  function activateTab(index) {
    const headerTab = headerTabs[index];
    const mobileTab = mobileTabs[index];

    if (headerTab) {
      headerTab.classList.add("active");
      headerTab.setAttribute("aria-selected", "true");
      moveGlider(headerTab);
    }

    if (mobileTab) {
      mobileTab.classList.add("active");
    }
  }

  /* -----------------------------------------
     GLIDER
  ----------------------------------------- */
  function moveGlider(tab) {
    if (!glider || !tab) return;

    const tabRect = tab.getBoundingClientRect();
    const parentRect = tab.parentElement.getBoundingClientRect();

    glider.style.width = `${tabRect.width}px`;
    glider.style.transform =
      `translateX(${tabRect.left - parentRect.left}px)`;
  }

  window.addEventListener("resize", () => {
    const active = document.querySelector(".tab.active");
    if (active) moveGlider(active);
  });

  /* -----------------------------------------
     ROUTE-BASED ACTIVE TAB
  ----------------------------------------- */
  function syncWithRoute() {
    const currentPath = window.location.pathname;

    const index = routes.findIndex(r =>
      currentPath.startsWith(r.path)
    );

    if (index !== -1) {
      clearActive();
      activateTab(index);
    }
  }

  /* -----------------------------------------
     HEADER TAB CLICK
  ----------------------------------------- */
  headerTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      clearActive();
      activateTab(index);
      history.pushState({}, "", routes[index].path);
    });
  });

  /* -----------------------------------------
     MOBILE TAB CLICK
  ----------------------------------------- */
  mobileTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      clearActive();
      activateTab(index);
      history.pushState({}, "", routes[index].path);
    });
  });

  /* -----------------------------------------
     SCROLL SPY (Dashboard Sections)
  ----------------------------------------- */
  const sections = document.querySelectorAll("[data-section]");

  if (sections.length) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const key = entry.target.dataset.section;
            const index = routes.findIndex(r => r.key === key);

            if (index !== -1) {
              clearActive();
              activateTab(index);
            }
          }
        });
      },
      {
        threshold: 0.6
      }
    );

    sections.forEach(section => observer.observe(section));
  }

  /* -----------------------------------------
     KEYBOARD ACCESSIBILITY (HEADER TABS)
  ----------------------------------------- */
  const tabList = document.querySelector(".tabs");

  tabList?.addEventListener("keydown", e => {
    const tabs = [...headerTabs];
    const index = tabs.indexOf(document.activeElement);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = tabs[index + 1] || tabs[0];
      next.focus();
      next.click();
    }

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = tabs[index - 1] || tabs[tabs.length - 1];
      prev.focus();
      prev.click();
    }
  });

  /* -----------------------------------------
     INIT
  ----------------------------------------- */
  syncWithRoute();
});
