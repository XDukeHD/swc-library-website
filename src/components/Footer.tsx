import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-bg-dark border-t border-white/5 py-12 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-brand-red text-white font-black px-2.5 py-1 rounded text-sm tracking-wider">
              SWC
            </span>
            <span className="text-text-primary font-bold tracking-tight">
              LIBRARY
            </span>
          </div>
          <p className="text-xs text-text-secondary max-w-md mt-1">
            SWC Library is an database for Nintendo Switch games. We do not host any illegal files; all links are provided by users or gathered from public networks. Our bot search for public download links on internet and add it to the database.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2">
          <span className="text-xs text-text-secondary">
            &copy; {new Date().getFullYear()} SWC Library. All rights reserved.
          </span>
          <div className="flex gap-4 text-xs text-text-secondary">
            <Link href="/" className="hover:text-brand-red transition-colors duration-200">
              Home
            </Link>
            <span>&bull;</span>
            <Link href="/category" className="hover:text-brand-purple transition-colors duration-200">
              Categories
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
