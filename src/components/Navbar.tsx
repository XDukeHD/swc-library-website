import Link from 'next/link';
import SearchInput from './SearchInput';
import { Suspense } from 'react';
import { FiGrid, FiSettings } from 'react-icons/fi';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 glassmorphism shadow-lg border-b border-white/5 py-4 px-6 md:px-12 flex flex-col sm:flex-row gap-4 items-center justify-between">
      <Link href="/" className="flex items-center gap-3 group">
        <Image 
          src="/assets/img/logo-nbg.png" 
          alt="SWC Library" 
          width={32} 
          height={32} 
          style={{ width: 'auto', height: 'auto' }} 
          className="rounded-lg group-hover:scale-105 transition-transform drop-shadow-md" 
        />
        <div className="bg-brand-red text-white font-black px-3 py-1.5 rounded-lg text-lg tracking-wider transform group-hover:scale-105 transition-all duration-200 shadow-md shadow-brand-red/20">
          SWC
        </div>
        <span className="text-text-primary font-bold text-xl tracking-tight group-hover:text-brand-purple transition-colors duration-200">
          LIBRARY
        </span> 
      </Link>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        <Suspense fallback={<div className="w-48 h-9 bg-bg-card rounded-full animate-pulse" />}>
          <SearchInput />
        </Suspense>

        <div className="flex items-center gap-4">
          <Link
            href="/category"
            className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-brand-purple transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <FiGrid className="w-4 h-4" />
            Categories
          </Link>
         {/* <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-brand-red to-brand-purple hover:from-brand-red/90 hover:to-brand-purple/90 transition-all duration-200 px-4 py-2 rounded-full shadow-md shadow-brand-red/10"
          >
            <FiSettings className="w-4 h-4 animate-spin-slow" />
            Admin Panel
          </Link>*/}
        </div>
      </div>
    </nav>
  );
}
