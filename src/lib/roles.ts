export type UserRole = "PASSENGER" | "DRIVER" | "BOTH";

export function isDriver(role?: string | null): boolean {
  return role === "DRIVER" || role === "BOTH";
}

export function isPassenger(role?: string | null): boolean {
  return role === "PASSENGER" || role === "BOTH";
}

export function roleLabel(role?: string | null): string {
  switch (role) {
    case "PASSENGER":
      return "Passenger";
    case "DRIVER":
      return "Driver";
    case "BOTH":
      return "Driver & Passenger";
    default:
      return "User";
  }
}

/** Where to send the user after sign-up based on the role they picked. */
export function postSignupRedirect(role: UserRole): string {
  switch (role) {
    case "DRIVER":
      return "/onboarding?next=vehicle";
    case "PASSENGER":
      return "/onboarding?next=search";
    case "BOTH":
    default:
      return "/onboarding";
  }
}
