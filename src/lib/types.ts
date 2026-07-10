export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Publisher {
  id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image: string;
  screenshots: string[]; // JSON array of urls
  trailer_url: string;
  type: string; // NSP, XCI, etc.
  title_id: string;
  languages: string; // "English, Japanese, Spanish, etc."
  required_firmware: string;
  release_date: string;
  game_size: string; // e.g., "16 GB"
  game_version: string; // e.g., "1.0.0"
  publisher_id: string; // FK
  likes: number;
  created_at: string;
  updated_at: string;
}

export interface GameCategory {
  game_id: string;
  category_id: string;
}

export interface Mirror {
  label: string;
  url: string;
}

export interface DownloadLink {
  id: string;
  game_id: string;
  version: string; // e.g., "Base v1.0", "Update v1.2"
  mirrors: Mirror[];
  created_at: string;
}

export interface Comment {
  id: string;
  game_id: string;
  username: string;
  email: string;
  content: string;
  created_at: string;
}

export interface Report {
  id: string;
  game_id: string;
  email: string;
  reason: string;
  resolved: boolean;
  created_at: string;
}

export interface Admin {
  id: string;
  user_id: string;
  role: 'admin' | 'super_admin';
}

export interface DirectDownloadOption {
  id: string;
  game_id: string;
  label: string;        // e.g. "Base Game v1.0 [NSP]"
  cdn_url: string;      // Direct CDN URL
  file_size?: string;   // e.g. "5.6 GB"
  version?: string;     // e.g. "v1.3.0"
  region?: string;      // e.g. "Global", "USA", "EUR"
  sort_order: number;   // for ordering
  created_at: string;
}
