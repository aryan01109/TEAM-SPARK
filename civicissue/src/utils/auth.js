export function checkAuthStatus() {
  // Minimal stub for build-time usage. Real app will replace with real localStorage checks.
  return { isAuthenticated: false, token: null, userRole: null };
}

export function setAuthData(token, userRole) {
  // no-op for stub
  try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.setItem('token', token); window.localStorage.setItem('userRole', userRole); } } catch (e) {}
}

export function clearAuthData() {
  try { if (typeof window !== 'undefined' && window.localStorage) { window.localStorage.removeItem('token'); window.localStorage.removeItem('userRole'); } } catch (e) {}
}

export function isValidToken(token) {
  return !!token;
}
