import { auth } from "@/auth";
import DashboardApp from "@/components/DashboardApp";

export default async function Home() {
  const session = await auth();
  const user = session!.user;

  return (
    <DashboardApp
      user={{
        email: user.email ?? "",
        name: user.name ?? null,
        isAdmin: !!user.isAdmin,
        editableCategories: user.editableCategories ?? [],
      }}
    />
  );
}
