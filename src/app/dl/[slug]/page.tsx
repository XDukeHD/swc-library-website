import { db } from "@/lib/db";
import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FiDownload, FiHardDrive, FiGlobe, FiZap, FiExternalLink, FiInfo, FiArrowRight } from "react-icons/fi";
import { TiWarning } from "react-icons/ti";

interface DlPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: DlPageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await db.getGameByIdentifier(slug);

  if (!game) {
    return { title: "Not Found" };
  }

  return {
    title: `Download ${game.title}`,
    description: `Direct CDN download for ${game.title}.`,
  };
}

export default async function DirectDownloadPage({ params }: DlPageProps) {
  const { slug } = await params;
  const game = await db.getGameByIdentifier(slug);

  if (!game || !game.direct_download_options || game.direct_download_options.length === 0) {
    redirect("https://swclibrary.online");
  }

  const directOptions = game.direct_download_options!;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 w-full flex-1 flex flex-col gap-8">

      <div className="flex gap-5 items-center">
        <div className="relative w-20 h-28 rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-bg-surface shrink-0">
          {game.cover_image ? (
            <Image
              src={game.cover_image}
              alt={game.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-card">
              <FiDownload className="w-6 h-6 text-text-secondary" />
            </div>
          )}
          <span className={`absolute top-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
            game.type === "XCI" ? "bg-brand-purple text-white" : "bg-brand-red text-white"
          }`}>
            {game.type}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 min-w-0">
          {game.publisher && (
            <span className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">
              {game.publisher.name}
            </span>
          )}
          <h1 className="text-2xl font-black text-text-primary leading-tight">{game.title}</h1>
          <div className="flex flex-wrap gap-3 mt-1">
            {game.game_size && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <FiHardDrive className="w-3.5 h-3.5" />
                {game.game_size}
              </span>
            )}
            {game.game_version && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <FiZap className="w-3.5 h-3.5" />
                v{game.game_version}
              </span>
            )}
            {game.languages && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <FiGlobe className="w-3.5 h-3.5" />
                {game.languages}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {game.categories?.map((cat) => (
              <span
                key={cat.id}
                className="text-[10px] bg-white/5 border border-white/10 text-text-secondary px-2 py-0.5 rounded-full"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
            <FiDownload className="w-3 h-3" />
            CDN Direct Downloads
          </span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <div className="flex flex-col gap-3">
          {directOptions.map((opt, idx) => (
            <a
              key={opt.id}
              href={opt.cdn_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 bg-bg-card border border-white/5 hover:border-brand-red/30 hover:bg-bg-surface rounded-2xl p-4 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-red to-brand-purple flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                {idx + 1}
              </div>

              <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <span className="font-bold text-sm text-text-primary leading-tight">{opt.label}</span>
                <div className="flex flex-wrap gap-3 mt-1">
                  {opt.version && (
                    <span className="text-[10px] text-brand-purple font-bold">{opt.version}</span>
                  )}
                  {opt.region && opt.region !== "Global" && (
                    <span className="text-[10px] text-text-secondary font-semibold flex items-center gap-0.5">
                      <FiGlobe className="w-2.5 h-2.5" />
                      {opt.region}
                    </span>
                  )}
                  {opt.file_size && (
                    <span className="text-[10px] text-text-secondary font-semibold flex items-center gap-0.5">
                      <FiHardDrive className="w-2.5 h-2.5" />
                      {opt.file_size}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="text-[10px] font-bold text-brand-red group-hover:text-white bg-brand-red/10 group-hover:bg-brand-red border border-brand-red/20 group-hover:border-brand-red px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1">
                  <FiDownload className="w-3 h-3" />
                  Download
                </span>
                <FiExternalLink className="w-4 h-4 text-text-secondary group-hover:text-brand-red transition-colors" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-brand-purple/5 border border-brand-purple/15 rounded-2xl p-4 flex gap-3 items-start">
        <FiInfo className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-text-primary">Direct CDN</span>
          <p className="text-xs text-text-secondary leading-relaxed">
           Download links directly from SWC CDN, for more mirrors go to {" "}
            <a
              href={`https://swclibrary.online/roms/${game.slug}`}
              className="text-brand-red hover:underline font-bold"
            >
              the game full page
            </a>
            .
          </p>
        </div>
      </div>

       <div className="bg-brand-purple/5 border border-brand-purple/15 rounded-2xl p-4 flex gap-3 items-start">
        <TiWarning className="w-4 h-4 text-brand-purple shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-text-primary">Legal Notice</span>
          <p className="text-xs text-text-secondary leading-relaxed">
           This website don't host any rom files, all links are external and are not the responsibility of this website.
           Our CDN is just and link provider, We use free cloud hostings (e.g. Google Drive, Mega, Mediafire, etc) and we just proxy the links.
           We too use social medias (e.g. Discord, Telegram, Whatsapp, etc) to grab the roms, using public channels/chats/groups.
          </p>
        </div>
      </div>

      <div className="text-center">
        <a
          href={`https://swclibrary.online/roms/${game.slug}`}
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <FiArrowRight className="w-3 h-3 rotate-180" />
          View full page on SWC Library
        </a>
      </div>
    </div>
  );
}
