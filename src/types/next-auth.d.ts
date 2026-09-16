import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      isAdmin?: boolean;
      editableCategories?: string[];
    } & DefaultSession["user"];
  }
}
