import Navigation from "@/app/components/Navigation";
import DashboardClient from "@/components/dashboard/DashboardClient";

type DashboardPageProps = {
  params: Promise<{ ticker: string }>;
};

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { ticker } = await params;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <DashboardClient ticker={ticker.toUpperCase()} />
      </div>
    </div>
  );
}
