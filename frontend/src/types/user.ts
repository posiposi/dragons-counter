export interface User {
  id: string;
  email: string;
  registrationStatus: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}
