// js/core/permissions.js

export const ROLES = {
  ADMIN: "admin",
  SUPERVISOR: "supervisor",
  USER: "user"
};

export const PERMISSIONS = {
  admin: {
    dashboard: true,
    map: true,
    manageIssues: true,
    manageDepartments: true,
    reports: true,
    supervisorView: true
  },
  supervisor: {
    dashboard: false,
    map: true,
    manageIssues: false,
    manageDepartments: false,
    reports: false,
    supervisorView: true
  },
  user: {
    dashboard: false,
    map: false,
    manageIssues: false,
    manageDepartments: false,
    reports: false,
    supervisorView: false
  }
};

export function can(role, permission) {
  return Boolean(PERMISSIONS[role]?.[permission]);
}
