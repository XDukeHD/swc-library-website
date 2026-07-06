import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { FiChevronLeft, FiInfo, FiCalendar, FiGlobe, FiCpu, FiTag, FiFileText } from 'react-icons/fi';
import ClientPageTransition from '@/components/ClientPageTransition';
import GameCard from '@/components/GameCard';

// Import interactive subcomponents
import LikeButton from '@/components/game/LikeButton';
import DownloadModal from '@/components/game/DownloadModal';
import ReportModal from '@/components/game/ReportModal';
import CommentsSection from '@/components/game/CommentsSection';

interface GameDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GameDetailPage({ params }: GameDetailPageProps) {
  const { slug } = await params;
  const game = await db.getGameBySlug(slug);

  if (!game) {
    return (
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 text-center flex-grow flex flex-col justify-center items-center">
        <h1 className="text-3xl font-extrabold text-text-primary">Game Not Found</h1>
        <p className="text-text-secondary mt-2">The ROM backup you are looking for does not exist.</p>
        <Link href="/" className="text-brand-red hover:underline mt-4 font-semibold inline-flex items-center gap-1">
          <FiChevronLeft /> Back to Home
        </Link>
      </div>
    );
  }

  // Load Recommended Games
  const allGames = await db.getGames();
  const recommendedGames = allGames
    .filter(g => g.id !== game.id && (
      g.publisher_id === game.publisher_id || 
      g.categories?.some(cat => game.categories?.some(gc => gc.id === cat.id))
    ))
    .slice(0, 4);

  // Default FAQs
  const defaultFaqs = [
    {
      q: `How do I install this ${game.type} game on my Switch?`,
      a: `To install this ${game.type} file on your Nintendo Switch, you need a custom firmware environment (like Atmosphere). Use installer tools such as Tinfoil, Awoo Installer, or DBI. Always ensure your signature patches (sigpatches) are up to date.`
    },
    {
      q: `Do I need firmware v${game.required_firmware || 'latest'} to run this game?`,
      a: `Yes, this game requires system firmware version v${game.required_firmware || '16.0.0'} or higher. If you are on a lower firmware, the game will fail to launch or report an error. You can update your firmware using Daybreak.`
    },
    {
      q: `Can I play this game on PC emulators like Ryujinx or Yuzu/Suyu?`,
      a: `Yes, NSP and XCI files are compatible with PC emulators. Make sure to update your emulator's keys (prod.keys) and system firmware files to match or exceed the game's required firmware version (v${game.required_firmware || '16.0.0'}).`
    },
    {
      q: `How to Bypass 1fichier Waiting Time?`,
      a: `Check out https://nswpedia.com/tip/how-to-bypass-1fichier-waiting-time-download-limits for the solution.`
    }
  ];  

    return (
    <ClientPageTransition>
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-8 w-full flex-grow">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="text-xs font-bold text-text-secondary hover:text-brand-red inline-flex items-center gap-1 mb-8 transition-colors duration-200"
        >
          <FiChevronLeft /> BACK TO GAMES
        </Link>

        {/* Main Header / Cover Layout */}
        <div className="grid md:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          
          {/* Cover & Quick Actions */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-bg-surface w-full max-w-sm mx-auto md:mx-0">
              <Image
                src={game.cover_image || 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&q=80'}
                alt={game.title}
                fill
                priority
                className="object-cover"
              />
              <span className={`absolute top-4 left-4 text-xs font-black px-3 py-1 rounded-md shadow-md uppercase tracking-wider ${
                game.type === 'XCI' ? 'bg-brand-purple text-white' : 'bg-brand-red text-white'
              }`}>
                {game.type}
              </span>
            </div>

            {/* Like and Report Controls */}
            <div className="flex justify-between items-center max-w-sm mx-auto md:mx-0 w-full mt-2">
              <LikeButton gameId={game.id} initialLikes={game.likes} />
              <ReportModal gameId={game.id} gameTitle={game.title} />
            </div>
          </div>

          {/* Details Metadata */}
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              {game.publisher && (
                <Link 
                  href={`/publisher/${game.publisher.slug}`} 
                  className="text-sm font-bold text-brand-purple hover:underline w-fit uppercase tracking-wider"
                >
                  {game.publisher.name}
                </Link>
              )}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight">
                {game.title}
              </h1>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {game.categories?.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="text-xs bg-white/5 border border-white/10 hover:bg-brand-purple/20 hover:border-brand-purple/40 text-text-secondary hover:text-white px-3 py-1 rounded-full transition-all"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-bg-card border border-white/5 p-6 rounded-2xl">
              <div className="flex items-center gap-3">
                <FiInfo className="text-brand-purple w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Title ID</span>
                  <span className="text-xs font-mono text-text-primary line-clamp-1">{game.title_id || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiCpu className="text-brand-red w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Required FW</span>
                  <span className="text-xs font-semibold text-text-primary">{game.required_firmware ? `v${game.required_firmware}` : 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiFileText className="text-brand-purple w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Version</span>
                  <span className="text-xs font-semibold text-text-primary">v{game.game_version || '1.0.0'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiTag className="text-brand-red w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Game Size</span>
                  <span className="text-xs font-semibold text-text-primary">{game.game_size || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiCalendar className="text-brand-purple w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Release Date</span>
                  <span className="text-xs font-semibold text-text-primary">{game.release_date || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FiGlobe className="text-brand-red w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold">Languages</span>
                  <span className="text-xs font-semibold text-text-primary line-clamp-1" title={game.languages}>{game.languages || 'English'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-text-primary text-base uppercase tracking-tight">Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                {game.description}
              </p>
            </div>

            {/* Download Action Component */}
            <div className="pt-4">
              <DownloadModal downloadLinks={game.download_links || []} gameTitle={game.title} />
            </div>
          </div>
        </div>

        {/* Media (Screenshots & Trailer) */}
        {((game.screenshots && game.screenshots.length > 0) || game.trailer_url) && (
          <section className="mb-16 border-t border-white/5 pt-12">
            <h3 className="text-xl font-black uppercase text-text-primary tracking-tight mb-8">Game Media</h3>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Screenshots Gallery */}
              {game.screenshots && game.screenshots.length > 0 && (
                <div className="flex-1 flex flex-col gap-4">
                  <h4 className="font-bold text-sm text-text-secondary uppercase">Screenshots</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {game.screenshots.map((url, idx) => (
                      <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-white/5 bg-bg-card">
                        <img
                          src={url}
                          alt={`${game.title} screenshot ${idx + 1}`}
                          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Trailer */}
              {game.trailer_url && (
                <div className="lg:w-[450px] shrink-0 flex flex-col gap-4">
                  <h4 className="font-bold text-sm text-text-secondary uppercase">Official Trailer</h4>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/5">
                    <iframe
                      src={game.trailer_url}
                      title={`${game.title} Trailer`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* FAQ Section */}
        <section className="mb-16 border-t border-white/5 pt-12">
          <h3 className="text-xl font-black uppercase text-text-primary tracking-tight mb-8">Frequently Asked Questions</h3>
          <div className="flex flex-col gap-4">
            {defaultFaqs.map((faq, idx) => (
              <details
                key={idx}
                className="bg-bg-card border border-white/5 rounded-2xl group transition-all duration-200"
              >
                <summary className="font-bold text-sm text-text-primary p-5 cursor-pointer flex justify-between items-center select-none hover:text-brand-purple transition-colors">
                  <span>{faq.q}</span>
                  <span className="text-xs text-text-secondary group-open:rotate-180 transition-transform duration-200">
                    ▼
                  </span>
                </summary>
                <div className="px-5 pb-5 pt-1 text-sm text-text-secondary leading-relaxed border-t border-white/5 mt-[-1px]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Recommended Games */}
        {recommendedGames.length > 0 && (
          <section className="mb-16 border-t border-white/5 pt-12">
            <h3 className="text-xl font-black uppercase text-text-primary tracking-tight mb-8">Recommended Games</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedGames.map(recGame => (
                <GameCard key={recGame.id} game={recGame} />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section className="border-t border-white/5 pt-12">
          <CommentsSection gameId={game.id} initialComments={game.comments || []} />
        </section>

      </div>
    </ClientPageTransition>
  );
}
