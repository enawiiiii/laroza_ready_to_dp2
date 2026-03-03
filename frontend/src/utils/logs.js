// تسجيل أي عملية يقوم بها المستخدم (تسجيل دخول، خروج، تعديل، حذف...)
export const logAction = async ({ userId, action, details = "" }) => {
  try {
    const log = {
      userId,
      action,
      details,
      timestamp: new Date().toISOString(),
    };

    // تخزين مؤقت في LocalStorage (إلى أن تضيف API backend)
    const existing = JSON.parse(localStorage.getItem("logs") || "[]");
    existing.push(log);
    localStorage.setItem("logs", JSON.stringify(existing));

    console.log("LOG ACTION:", log);
  } catch (err) {
    console.error("Error logging action:", err);
  }
};