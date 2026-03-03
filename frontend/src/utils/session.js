let sessionInterval = null;

// بدء مراقبة الجلسة (يمكن تطويره لاحقًا)
export const startSessionTracking = () => {
  try {
    stopSessionTracking(); // منع التكرار

    sessionInterval = setInterval(() => {
      localStorage.setItem("lastActivity", Date.now());
    }, 30000); // كل 30 ثانية
  } catch (err) {
    console.error("Session tracking error:", err);
  }
};

// إيقاف مراقبة الجلسة
export const stopSessionTracking = () => {
  try {
    if (sessionInterval) {
      clearInterval(sessionInterval);
      sessionInterval = null;
    }
  } catch (err) {
    console.error("Error stopping session:", err);
  }
};
