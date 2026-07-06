'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaHeart } from 'react-icons/fa';
import { FiDownload, FiFolder } from 'react-icons/fi';
import { Game, Publisher, Category } from '../lib/types';

interface GameCardProps {
  game: Game & {
    publisher?: Publisher;
    categories?: Category[];
  };
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="bg-bg-card rounded-2xl overflow-hidden border border-white/5 shadow-lg shadow-black/25 flex flex-col group h-full"
    >
      <Link href={`/roms/${game.slug}`} className="relative aspect-[3/4] block overflow-hidden bg-bg-surface">
        <Image
          src={game.cover_image || 'https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&q=80'}
          alt={game.title}
          fill
          sizes="(max-w-768px) 100vw, (max-w-1200px) 50vw, 33vw"
          className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
        />
        
        {/* Format Badge (NSP / XCI) */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-xs font-black px-2.5 py-1 rounded-md shadow-md uppercase tracking-wider ${
            game.type === 'XCI' 
              ? 'bg-brand-purple text-white' 
              : 'bg-brand-red text-white'
          }`}>
            {game.type}
          </span>
        </div>

        {/* Size Badge */}
        <div className="absolute bottom-3 right-3">
          <span className="text-[10px] font-bold bg-black/70 backdrop-blur-md text-text-primary px-2 py-0.5 rounded-full border border-white/10">
            {game.game_size || 'Unknown Size'}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col flex-1 gap-2">
        <div className="flex items-center justify-between gap-2">
          {game.publisher ? (
            <Link 
              href={`/publisher/${game.publisher.slug}`}
              className="text-xs font-semibold text-brand-purple hover:underline"
            >
              {game.publisher.name}
            </Link>
          ) : (
            <span className="text-xs text-text-secondary">Unknown Publisher</span>
          )}
          
          <div className="flex items-center gap-1 text-xs text-text-secondary">
            <FaHeart className="text-brand-red w-3.5 h-3.5" />
            <span>{game.likes}</span>
          </div>
        </div>

        <Link href={`/roms/${game.slug}`} className="block">
          <h3 className="font-bold text-text-primary group-hover:text-brand-red transition-colors duration-200 line-clamp-1 text-base">
            {game.title}
          </h3>
        </Link>

        {/* Categories list */}
        {game.categories && game.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {game.categories.slice(0, 2).map(cat => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="text-[10px] bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary px-2 py-0.5 rounded transition-all duration-200"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-text-secondary font-mono">
            {game.title_id ? game.title_id.substring(0, 8) + '...' : 'N/A'}
          </span>
          
          <Link
            href={`/roms/${game.slug}`}
            className="flex items-center gap-1 text-xs font-bold text-brand-red group-hover:text-white bg-brand-red/10 group-hover:bg-brand-red px-3 py-1.5 rounded-lg transition-all duration-200"
          >
            <FiDownload />
            Download
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
