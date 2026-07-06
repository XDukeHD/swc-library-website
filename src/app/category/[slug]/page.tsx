import { db } from '@/lib/db';
import GameCard from '@/components/GameCard';
import ClientPageTransition from '@/components/ClientPageTransition';
import Link from 'next/link';
import { FiChevronLeft, FiFolder } from 'react-icons/fi';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;
  const category = await db.getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center flex-grow flex flex-col justify-center items-center">
        <h1 className="text-3xl font-extrabold text-text-primary">Category Not Found</h1>
        <p className="text-text-secondary mt-2">The category you are looking for does not exist.</p>
        <Link href="/category" className="text-brand-red hover:underline mt-4 font-semibold inline-flex items-center gap-1">
          <FiChevronLeft /> Back to Categories
        </Link>
      </div>
    );
  }

  const allGames = await db.getGames();
  const games = allGames.filter(game =>
    game.categories?.some(cat => cat.id === category.id)
  );

  return (
    <ClientPageTransition>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-grow">
        <Link 
          href="/category" 
          className="text-xs font-bold text-text-secondary hover:text-brand-purple inline-flex items-center gap-1 mb-6 transition-colors duration-200"
        >
          <FiChevronLeft /> ALL CATEGORIES
        </Link>

        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand-purple/10 p-3 rounded-xl border border-brand-purple/20 text-brand-purple">
              <FiFolder className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight">
                {category.name} <span className="text-text-secondary text-lg font-normal">Genre</span>
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                Displaying {games.length} {games.length === 1 ? 'game' : 'games'} matching this category
              </p>
            </div>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-card rounded-3xl border border-white/5 p-8">
            <h3 className="text-xl font-bold text-text-primary">No Games in Category</h3>
            <p className="text-text-secondary text-sm max-w-sm mt-2">
              There are currently no games cataloged in the {category.name} category. Check back later or check other genres!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {games.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </div>
    </ClientPageTransition>
  );
}
