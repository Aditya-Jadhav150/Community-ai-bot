"use client";

import { useDemoAuth } from "@/context/DemoAuthContext";

export const useDemoUser = () => {
  const { user, isLoading, updateUser } = useDemoAuth();
  return { user, isLoading, updateUser };
};
