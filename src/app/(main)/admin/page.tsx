import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { checkAdminSessionAction } from '@/lib/actions';
import DashboardConsole from '@/components/admin/DashboardConsole';
import ClientPageTransition from '@/components/ClientPageTransition';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await checkAdminSessionAction();

  if (!session.isLoggedIn || !session.role) {
    redirect('/admin/login');
  }

  const role = session.role;

  const games = await db.getGames();
  const categories = await db.getCategories();
  const publishers = await db.getPublishers();
  const comments = await db.getComments();
  const reports = await db.getReports();
  const admins = await db.getAdmins();

  return (
    <ClientPageTransition>
      <div className="w-full flex-grow bg-bg-dark">
        <DashboardConsole
          initialGames={games}
          initialCategories={categories}
          initialPublishers={publishers}
          initialComments={comments}
          initialReports={reports}
          initialAdmins={admins}
          adminRole={role}
        />
      </div>
    </ClientPageTransition>
  );
}
