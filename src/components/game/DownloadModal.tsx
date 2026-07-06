'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiX, FiExternalLink } from 'react-icons/fi';
import { DownloadLink } from '@/lib/types';

interface DownloadModalProps {
  downloadLinks: DownloadLink[];
  gameTitle: string;
}

export default function DownloadModal({ downloadLinks, gameTitle }: DownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const groupedByServer = downloadLinks.reduce((acc, link) => {
    link.mirrors.forEach((mirror) => {
      const serverName = mirror.label;
      if (!acc[serverName]) {
        acc[serverName] = [];
      }
      acc[serverName].push({
        version: link.version,
        url: mirror.url,
      });
    });
    return acc;
  }, {} as Record<string, { version: string; url: string }[]>);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-red to-brand-purple text-white hover:from-brand-red/90 hover:to-brand-purple/90 font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-brand-red/15 w-full md:w-auto text-base active:scale-98 cursor-pointer"
      >
        <FiDownload className="w-5 h-5" />
        Download Game
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-lg bg-bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col gap-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Select Download Version</h3>
                  <p className="text-xs text-text-secondary mt-1">{gameTitle}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {downloadLinks.length === 0 ? (
                <div className="text-center py-8 bg-bg-card rounded-xl border border-white/5 text-text-secondary text-sm">
                  No download mirrors are currently available for this game.
                </div>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[350px] pr-1">
                  {Object.entries(groupedByServer).map(([server, mirrors]) => (
                    <div 
                      key={server} 
                      className="bg-bg-card border border-white/5 p-4 rounded-xl flex flex-col gap-3"
                    >
                      <h4 className="font-bold text-sm text-text-primary text-brand-purple uppercase tracking-wider">
                        {server}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {mirrors.map((mirror, idx) => (
                          <a
                            key={idx}
                            href={mirror.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-xs font-semibold bg-bg-surface border border-white/5 hover:border-brand-purple/40 text-text-secondary hover:text-white px-3 py-2.5 rounded-lg transition-all duration-200 group"
                          >
                            <span>{mirror.version}</span>
                            <FiExternalLink className="w-3.5 h-3.5 text-text-secondary group-hover:text-brand-purple transition-colors duration-200" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-text-secondary leading-relaxed bg-brand-red/5 border border-brand-red/10 p-3 rounded-lg">
                <strong>Important:</strong> If it's an indie game and you can afford it, consider buying the original game to support the developers :3
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
