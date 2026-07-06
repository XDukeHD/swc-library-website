import { db } from '@/lib/db';
import GameCard from '@/components/GameCard';
import ClientPageTransition from '@/components/ClientPageTransition';
import { FiDownload, FiSearch, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedParams = await searchParams;
  const searchQuery = typeof resolvedParams.search === 'string' ? resolvedParams.search : '';

  const allGames = await db.getGames();
  
  const filteredGames = searchQuery
    ? allGames.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (game.title_id && game.title_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (game.publisher && game.publisher.name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : allGames;

  const topDownloaded = [...filteredGames].sort((a, b) => b.likes - a.likes).slice(0, 4);

  const latestRoms = [...filteredGames].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 8);

  return (
    <ClientPageTransition>
      {searchQuery ? (
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 w-full flex-1">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">
                Search Results for <span className="text-brand-purple">"{searchQuery}"</span>
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Found {filteredGames.length} games matching your request
              </p>
            </div>
            <Link href="/" className="text-sm text-brand-red hover:underline font-semibold">
              Clear Search
            </Link>
          </div>

          {filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-card rounded-3xl border border-white/5 p-8">
              <FiSearch className="w-12 h-12 text-text-secondary mb-4" />
              <h3 className="text-xl font-bold text-text-primary">No Games Found</h3>
              <p className="text-text-secondary text-sm max-w-sm mt-2">
                We couldn't find any games matching your search query. Try checking your spelling or search for another keyword.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredGames.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="w-full flex-grow">
          <section className="relative overflow-hidden bg-gradient-to-br from-bg-dark via-bg-dark to-brand-purple/20 border-b border-white/5 py-20 px-6 md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(230,57,70,0.15),transparent_50%)]" />
            <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-12 items-center relative z-10">
              <div className="md:col-span-7 flex flex-col gap-6 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full w-fit mx-auto md:mx-0">
                  <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                  <span className="text-xs text-text-primary font-bold tracking-wider uppercase">Nintendo Switch ROMs Archival</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-text-primary leading-none tracking-tight">
                  YOUR ULTIMATE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-brand-purple">
                    SWITCH LIBRARY
                  </span>
                </h1>
                <p className="text-text-secondary text-base md:text-lg max-w-lg leading-relaxed">
                  Download Switch ROMs in NSP and XCI formats. Zero ads, direct high-speed mirrors, and game updates at your fingertips.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start">
                  <a
                    href="#latest"
                    className="flex items-center justify-center gap-2 bg-brand-red text-white hover:bg-brand-red/90 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-brand-red/20 w-full sm:w-auto"
                  >
                    <FiDownload className="w-5 h-5" />
                    Browse Latest
                  </a>
                  <Link
                    href="/category"
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 font-bold px-8 py-3.5 rounded-xl transition-all duration-200 w-full sm:w-auto"
                  >
                    Categories
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center relative">
                <div className="w-72 h-72 rounded-full bg-brand-purple/20 blur-3xl absolute -z-10" />
                <div className="relative border-4 border-white/10 bg-bg-surface p-6 rounded-3xl shadow-2xl flex flex-col gap-4 transform rotate-2 max-w-xs w-full">
                  <div className="flex justify-between items-center">
                    <span className="bg-brand-red text-white font-bold text-xs px-2 py-0.5 rounded">NSP</span>
                    <span className="text-xs font-mono text-text-secondary">#0100F2C...</span>
                  </div>
                  <div className="aspect-[4/3] bg-bg-card rounded-xl overflow-hidden relative border border-white/5">
                    <img 
                      src="https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=400&q=80" 
                      alt="Tears of the Kingdom" 
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text-primary">Zelda: Tears of the Kingdom</h3>
                    <p className="text-xs text-text-secondary">Release: May 2023</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-brand-red/10 p-2 rounded-xl border border-brand-red/20 text-brand-red">
                <FiTrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase">Top Rated / Downloaded</h2>
                <p className="text-xs text-text-secondary">Most liked games by the community</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {topDownloaded.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>

          <section id="latest" className="max-w-7xl mx-auto px-6 md:px-12 py-16 border-t border-white/5">
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-brand-purple/10 p-2 rounded-xl border border-brand-purple/20 text-brand-purple">
                <FiDownload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-text-primary uppercase">Latest Releases</h2>
                <p className="text-xs text-text-secondary">Recently added switch backups</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latestRoms.map(game => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        </div>
      )}
    </ClientPageTransition>
  );
}
