// Attendance tracking - stored locally since /attendance API is not in backend
function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
  };
}

export async function logLogin(userId) {
  try {
    const device = getDeviceInfo();
    const time = new Date().toISOString();
    const existing = JSON.parse(localStorage.getItem("attendance") || "[]");
    existing.push({ userId, action: "login", time, device });
    localStorage.setItem("attendance", JSON.stringify(existing));
  } catch (err) {
    console.error("Attendance login error:", err);
  }
}

export async function logLogout(userId) {
  try {
    const device = getDeviceInfo();
    const time = new Date().toISOString();
    const existing = JSON.parse(localStorage.getItem("attendance") || "[]");
    existing.push({ userId, action: "logout", time, device });
    localStorage.setItem("attendance", JSON.stringify(existing));
  } catch (err) {
    console.error("Attendance logout error:", err);
  }
}

export function calculateSessionDuration(loginTime, logoutTime) {
  const start = new Date(loginTime);
  const end = new Date(logoutTime);
  const diffMs = end - start;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  return { hours, minutes: minutes % 60 };
}
