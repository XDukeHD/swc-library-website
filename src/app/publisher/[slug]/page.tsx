import { db } from '@/lib/db';
import GameCard from '@/components/GameCard';
import ClientPageTransition from '@/components/ClientPageTransition';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiAward } from 'react-icons/fi';

interface PublisherPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublisherPage({ params }: PublisherPageProps) {
  const { slug } = await params;
  const publisher = await db.getPublisherBySlug(slug);

  if (!publisher) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center flex-grow flex flex-col justify-center items-center">
        <h1 className="text-3xl font-extrabold text-text-primary">Publisher Not Found</h1>
        <p className="text-text-secondary mt-2">The publisher you are looking for does not exist.</p>
        <Link href="/" className="text-brand-red hover:underline mt-4 font-semibold inline-flex items-center gap-1">
          <FiChevronLeft /> Back to Home
        </Link>
      </div>
    );
  }

  const allGames = await db.getGames();
  const games = allGames.filter(g => g.publisher_id === publisher.id);

  return (
    <ClientPageTransition>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-grow">
        <Link 
          href="/" 
          className="text-xs font-bold text-text-secondary hover:text-brand-purple inline-flex items-center gap-1 mb-8 transition-colors duration-200"
        >
          <FiChevronLeft /> BACK TO HOME
        </Link>

        {/* Publisher Info Header */}
        <div className="bg-bg-card border border-white/5 p-8 rounded-3xl mb-12 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-purple/5 blur-3xl rounded-full -z-10" />
          
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-bg-surface border border-white/10 shrink-0">
            <Image
              src={publisher.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&q=80'}
              alt={publisher.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2.5 justify-center md:justify-start">
              <h1 className="text-3xl font-black text-text-primary uppercase tracking-tight">{publisher.name}</h1>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-brand-purple/15 text-brand-purple px-2 py-0.5 rounded-full w-fit mx-auto md:mx-0">
                <FiAward /> Official Publisher
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
              {publisher.description}
            </p>
          </div>
        </div>

        {/* Publisher Games Grid */}
        <h2 className="text-xl font-black text-text-primary uppercase mb-6 tracking-tight">
          Games Published by {publisher.name} ({games.length})
        </h2>

        {games.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-card rounded-3xl border border-white/5 p-8">
            <h3 className="text-xl font-bold text-text-primary">No Games Found</h3>
            <p className="text-text-secondary text-sm max-w-sm mt-2">
              There are currently no games matching publisher {publisher.name} in our database.
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
