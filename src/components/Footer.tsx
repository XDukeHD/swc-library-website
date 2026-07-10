import Link from 'next/link';
import Image from 'next/image';
import { GitFork, GitMerge } from 'lucide-react';

export default function Footer() {
  const commitHash = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;
  const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
  const repoUrl = 'https://github.com/XDukeHD/swc-library-website';

  const shortHash = commitHash?.slice(0, 7) || 'local';

  return (
    <footer className="bg-bg-dark border-t border-white/5 py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-stretch gap-6">
        
        <div className="flex flex-col gap-2 text-center md:text-left flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <Image
              src="/assets/img/logo-nbg.png"
              alt="SWC Library Logo"
              width={100}
              height={100}
              style={{ width: 'auto', height: 'auto' }}
              className="rounded-lg transition-transform group-hover:scale-105"
            />
          </div>
          <p className="text-xs text-text-secondary max-w-md mt-1 leading-relaxed">
            SWC Library is a database for Nintendo Switch games. We do not host any illegal files; all links are provided by users or gathered from public networks. Our bot searches public download links on the internet and adds them to the database.
          </p>
        </div>

        <div className="flex flex-col justify-between items-center md:items-end gap-4 text-center md:text-right">
          
          <div className="flex gap-4 text-xs font-medium text-text-secondary">
            <Link href="/" className="hover:text-brand-red transition-colors duration-200">
              Home
            </Link>
            <span className="text-white/10">&bull;</span>
            <Link href="/category" className="hover:text-brand-purple transition-colors duration-200">
              Categories
            </Link>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <span className="text-xs text-text-secondary/80">
              &copy; {new Date().getFullYear()} SWC Library. All rights reserved.
            </span>
            
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-text-secondary/60 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-md">
              <span className="flex items-center gap-1">
                <GitFork size={12} className="text-text-secondary/40" />
                {branch || 'main'}
              </span>
              <span className="text-white/10">|</span>
              <a 
                href={commitHash ? `${repoUrl}/commit/${commitHash}` : repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-brand-purple transition-colors duration-150 group"
              >
                <GitMerge size={12} className="text-text-secondary/40 group-hover:text-brand-purple" />
                <span className="underline decoration-dotted">{shortHash}</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}