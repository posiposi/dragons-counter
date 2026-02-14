export type RegistrationStatus = "PENDING" | "APPROVED" | "REJECTED" | "BANNED";

export type UserRole = "USER" | "ADMIN";

export interface AdminUser {
  id: string;
  email: string;
  registrationStatus: RegistrationStatus;
  role: UserRole;
}
