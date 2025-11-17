// Moved from core/models/auth.ts

// Define the Auth type
export type Auth = {
  id: string;
  username: string;
  password: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
};