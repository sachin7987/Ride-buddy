import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: "PASSENGER" | "DRIVER" | "BOTH";
      kycStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
      isAdmin: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    kycStatus?: string;
    isAdmin?: boolean;
  }
}
