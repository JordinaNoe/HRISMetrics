import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminAccessClient from "@/components/AdminAccessClient";

export default async function AdminAccessPage() {
  const session = await auth();
  if (!session?.user?.isAdmin) redirect("/");
  return <AdminAccessClient />;
}
