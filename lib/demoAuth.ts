import { DemoRole, DemoUser, demoUsers } from "./demoData/users";

export const demoLogin = (role: "citizen" | "admin") => {
  if (typeof window === "undefined") return;
  localStorage.setItem("cha_demo_user", JSON.stringify(demoUsers[role]));
};

export const getDemoUser = (): DemoUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("cha_demo_user");
  return raw ? JSON.parse(raw) : null;
};

export const demoLogout = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("cha_demo_user");
};
