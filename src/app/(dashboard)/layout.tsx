import { redirect } from "next/navigation";
import { getOrganizerSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOrganizerSession();

  if (!session.isAuthenticated || !session.user) {
    redirect("/login?redirect=/dashboard");
  }

  if (!session.isOrganizer) {
    redirect("/?error=unauthorized_organizer_only");
  }

  return (
    <div className="flex-1 bg-[#090d16] text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
