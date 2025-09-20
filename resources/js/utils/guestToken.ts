function getSafeUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback UUID generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getGuestToken(): string {
  let token = localStorage.getItem("guest_token");
  if (!token) {
    token = getSafeUUID(); // ✅ now safe
    localStorage.setItem("guest_token", token);
  }
  return token;
}
