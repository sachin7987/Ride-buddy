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

/** Where to send the user after sign-up. The role is already captured during
 *  sign-up itself, so we send everyone straight to identity verification —
 *  the only remaining step before they can use the platform. */
export function postSignupRedirect(_role: UserRole): string {
  return "/kyc";
}

/**
 * KYC documents a user must submit for full verification, by role:
 *   • Passenger → AADHAAR + SELFIE (no driving license)
 *   • Driver / Both → DRIVING_LICENSE + AADHAAR + SELFIE
 */
export function requiredKycDocs(role?: string | null): string[] {
  if (role === "PASSENGER") return ["AADHAAR", "SELFIE"];
  return ["DRIVING_LICENSE", "AADHAAR", "SELFIE"];
}
