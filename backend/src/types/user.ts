export enum UserType {
  NORMAL = "normal",
  SUPERADMIN = "superadmin",
  DEVELOPER = "developer",
}

export enum AccountType {
  FRACHISOR = "frachisor",
  FRACHISEE = "franchisee",
}

export enum IdType {
  NATIONAL_ID = "national id",
  EMIRATES_ID = "emirates id",
  PASSPORT = "passport",
}

export interface UserPayload {
  id?: string;
  first_name?: string;
  last_name?: string;
  photo?: string;
  email: string;
  location?: string;
  user_type?: string;
  is_active?: string;
  is_admin?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}
