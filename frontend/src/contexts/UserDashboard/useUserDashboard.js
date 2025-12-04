import { useContext } from "react";
import { UserDashboardContext } from "./UserDashboardContext.js";

export function useUserDashboard() {
  return useContext(UserDashboardContext);
}