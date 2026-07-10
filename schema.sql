-- SWC Library Supabase Schema Setup

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Publishers Table
CREATE TABLE IF NOT EXISTS publishers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Games Table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    cover_image TEXT,
    screenshots JSONB DEFAULT '[]'::jsonb,
    trailer_url TEXT,
    type VARCHAR(50) DEFAULT 'NSP',
    title_id VARCHAR(100),
    languages TEXT DEFAULT 'English',
    required_firmware VARCHAR(50),
    release_date VARCHAR(50),
    game_size VARCHAR(50),
    game_version VARCHAR(50) DEFAULT '1.0.0',
    publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Game Categories Junction Table
CREATE TABLE IF NOT EXISTS game_categories (
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, category_id)
);

-- 5. Download Links Table
CREATE TABLE IF NOT EXISTS download_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    version VARCHAR(100) NOT NULL,
    mirrors JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Admins Table
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) CHECK (role IN ('admin', 'super_admin')) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Direct Download Options Table (CDN links for dl.* subdomain)
CREATE TABLE IF NOT EXISTS direct_download_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,           -- e.g. "Base Game v1.0 [NSP]"
    cdn_url TEXT NOT NULL,                 -- Direct CDN URL
    file_size VARCHAR(50),                 -- e.g. "5.6 GB"
    version VARCHAR(100),                  -- e.g. "v1.3.0"
    region VARCHAR(50) DEFAULT 'Global',   -- e.g. "Global", "USA", "EUR"
    sort_order INTEGER DEFAULT 0,          -- Display order
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups by game_id
CREATE INDEX IF NOT EXISTS idx_direct_download_options_game_id
    ON direct_download_options(game_id);
