import { db } from '@/lib/db';
import Link from 'next/link';
import ClientPageTransition from '@/components/ClientPageTransition';
import { FiFolder, FiChevronRight } from 'react-icons/fi';

export default async function CategoryListPage() {
  const categories = await db.getCategories();
  const allGames = await db.getGames();

  // Calculate game count for each category
  const categoriesWithCounts = categories.map(cat => {
    const gameCount = allGames.filter(game => 
      game.categories?.some(c => c.id === cat.id)
    ).length;
    return { ...cat, gameCount };
  });

  return (
    <ClientPageTransition>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 w-full flex-grow">
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-text-primary">
            Explore <span className="text-brand-purple">Categories</span>
          </h1>
          <p className="text-text-secondary text-sm mt-2">
            Find Nintendo Switch ROMs filtered by your favorite gaming genres
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map(cat => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="bg-bg-card hover:bg-bg-surface border border-white/5 hover:border-brand-purple/20 p-6 rounded-2xl flex items-center justify-between group transition-all duration-300 shadow-md hover:shadow-brand-purple/5"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-purple/10 group-hover:bg-brand-purple/25 p-3.5 rounded-xl border border-brand-purple/20 text-brand-purple transition-colors duration-300">
                  <FiFolder className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-lg group-hover:text-brand-purple transition-colors duration-200">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {cat.gameCount} {cat.gameCount === 1 ? 'game' : 'games'} available
                  </p>
                </div>
              </div>
              <div className="text-text-secondary group-hover:text-brand-purple group-hover:translate-x-1.5 transition-all duration-200">
                <FiChevronRight className="w-5 h-5" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ClientPageTransition>
  );
}
