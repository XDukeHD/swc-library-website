const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// 1. Load and parse .env manually
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('Error: .env file not found at ' + envPath);
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

const postgresUri = env.POSTEGRESQL_URI;
if (!postgresUri) {
  console.error('Error: POSTEGRESQL_URI not found in .env');
  process.exit(1);
}

console.log('Connecting to PostgreSQL database...');
const client = new Client({
  connectionString: postgresUri,
  ssl: {
    rejectUnauthorized: false
  }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully!');

    // 2. Load schema.sql and run it
    const schemaPath = path.join(__dirname, '../schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.error('Error: schema.sql not found at ' + schemaPath);
      process.exit(1);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('Applying database schema (schema.sql)...');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');

    // 3. Setup RLS policies & helper functions
    console.log('Setting up Row Level Security (RLS) and policies...');
    const rlsSql = `
      -- Enable extensions
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      -- Enable RLS on all tables
      ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
      ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE games ENABLE ROW LEVEL SECURITY;
      ALTER TABLE game_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE download_links ENABLE ROW LEVEL SECURITY;
      ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
      ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
      ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

      -- Helper admin functions
      CREATE OR REPLACE FUNCTION public.is_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM public.admins 
          WHERE user_id = auth.jwt()->>'email' OR user_id = auth.uid()::text
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      CREATE OR REPLACE FUNCTION public.is_super_admin()
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM public.admins 
          WHERE (user_id = auth.jwt()->>'email' OR user_id = auth.uid()::text) 
            AND role = 'super_admin'
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;

      -- Drop existing policies if any to prevent duplicates
      DROP POLICY IF EXISTS "Allow public read access" ON publishers;
      DROP POLICY IF EXISTS "Allow admin write access" ON publishers;
      DROP POLICY IF EXISTS "Allow public read access" ON categories;
      DROP POLICY IF EXISTS "Allow admin write access" ON categories;
      DROP POLICY IF EXISTS "Allow public read access" ON games;
      DROP POLICY IF EXISTS "Allow admin write access" ON games;
      DROP POLICY IF EXISTS "Allow public read access" ON game_categories;
      DROP POLICY IF EXISTS "Allow admin write access" ON game_categories;
      DROP POLICY IF EXISTS "Allow public read access" ON download_links;
      DROP POLICY IF EXISTS "Allow admin write access" ON download_links;
      DROP POLICY IF EXISTS "Allow public read access" ON comments;
      DROP POLICY IF EXISTS "Allow public insert" ON comments;
      DROP POLICY IF EXISTS "Allow admin delete" ON comments;
      DROP POLICY IF EXISTS "Allow public insert" ON reports;
      DROP POLICY IF EXISTS "Allow admin access" ON reports;
      DROP POLICY IF EXISTS "Allow admin read access" ON admins;
      DROP POLICY IF EXISTS "Allow super admin write access" ON admins;

      -- Recreate policies
      CREATE POLICY "Allow public read access" ON publishers FOR SELECT USING (true);
      CREATE POLICY "Allow admin write access" ON publishers FOR ALL TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
      CREATE POLICY "Allow admin write access" ON categories FOR ALL TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow public read access" ON games FOR SELECT USING (true);
      CREATE POLICY "Allow admin write access" ON games FOR ALL TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow public read access" ON game_categories FOR SELECT USING (true);
      CREATE POLICY "Allow admin write access" ON game_categories FOR ALL TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow public read access" ON download_links FOR SELECT USING (true);
      CREATE POLICY "Allow admin write access" ON download_links FOR ALL TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow public read access" ON comments FOR SELECT USING (true);
      CREATE POLICY "Allow public insert" ON comments FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow admin delete" ON comments FOR DELETE TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow public insert" ON reports FOR INSERT WITH CHECK (true);
      CREATE POLICY "Allow admin access" ON reports FOR ALL TO authenticated USING (public.is_admin());

      CREATE POLICY "Allow admin read access" ON admins FOR SELECT TO authenticated USING (public.is_admin());
      CREATE POLICY "Allow super admin write access" ON admins FOR ALL TO authenticated USING (public.is_super_admin());
    `;
    await client.query(rlsSql);
    console.log('RLS settings successfully applied.');

    // 4. Create admin user '[your_email]' with password 'your_password' in auth.users
    console.log('Registering user [your_user] as super admin...');
    const authSql = `
      DO $$
      DECLARE
          new_user_id UUID := uuid_generate_v4();
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = '[EMAIL_ADDRESS]') THEN
              INSERT INTO auth.users (
                  instance_id,
                  id,
                  aud,
                  role,
                  email,
                  encrypted_password,
                  email_confirmed_at,
                  raw_app_meta_data,
                  raw_user_meta_data,
                  is_super_admin,
                  created_at,
                  updated_at,
                  confirmation_token,
                  recovery_token,
                  email_change_token_new,
                  email_change,
                  phone
              ) VALUES (
                  '00000000-0000-0000-0000-000000000000',
                  new_user_id,
                  'authenticated',
                  'authenticated',
                  '[your_email]',
                  crypt('your_password', gen_salt('bf')),
                  now(),
                  '{"provider": "email", "providers": ["email"]}'::jsonb,
                  '{}'::jsonb,
                  false,
                  now(),
                  now(),
                  '',
                  '',
                  '',
                  '',
                  ''
              );
              
              -- Register in public.admins
              INSERT INTO public.admins (user_id, role)
              VALUES ('[your_email]', 'super_admin')
              ON CONFLICT (user_id) DO NOTHING;

              INSERT INTO public.admins (user_id, role)
              VALUES (new_user_id::text, 'super_admin')
              ON CONFLICT (user_id) DO NOTHING;
          ELSE
              INSERT INTO public.admins (user_id, role)
              VALUES ('[your_email]', 'super_admin')
              ON CONFLICT (user_id) DO NOTHING;
              
              INSERT INTO public.admins (user_id, role)
              VALUES ((SELECT id::text FROM auth.users WHERE email = '[your_email]'), 'super_admin')
              ON CONFLICT (user_id) DO NOTHING;
          END IF;
      END $$;
    `;
    await client.query(authSql);
    console.log('User your_user_has_been registered.');

    // 5. Read mockdata and seed tables
    const dbPath = path.join(__dirname, '../db.json');
    if (!fs.existsSync(dbPath)) {
      console.log('No db.json found. Skipping mock seeding.');
      return;
    }
    
    console.log('Reading mockdata from db.json and seeding tables...');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Helper function to map mock string IDs to valid UUIDs deterministically
    function toUuid(id) {
      if (!id) return null;
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) return id;

      const match = id.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : 0;
      
      if (id.startsWith('pub-')) {
        return `00000000-0000-0000-0000-${num.toString(16).padStart(12, '0')}`;
      }
      if (id.startsWith('cat-')) {
        return `00000000-0000-0000-0001-${num.toString(16).padStart(12, '0')}`;
      }
      if (id.startsWith('game-')) {
        return `00000000-0000-0000-0002-${num.toString(16).padStart(12, '0')}`;
      }
      if (id.startsWith('link-')) {
        return `00000000-0000-0000-0003-${num.toString(16).padStart(12, '0')}`;
      }
      if (id.startsWith('comm-')) {
        return `00000000-0000-0000-0004-${num.toString(16).padStart(12, '0')}`;
      }
      if (id.startsWith('rep-')) {
        return `00000000-0000-0000-0005-${num.toString(16).padStart(12, '0')}`;
      }
      if (id.startsWith('admin-')) {
        return `00000000-0000-0000-0006-${num.toString(16).padStart(12, '0')}`;
      }
      
      // Fallback
      return '00000000-0000-0000-0009-' + id.padEnd(12, '0').substring(0, 12);
    }

    // Insert publishers
    if (dbData.publishers && dbData.publishers.length > 0) {
      console.log(`Seeding ${dbData.publishers.length} publishers...`);
      for (const p of dbData.publishers) {
        await client.query(`
          INSERT INTO publishers (id, name, slug, logo, description)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, logo = EXCLUDED.logo, description = EXCLUDED.description
        `, [toUuid(p.id), p.name, p.slug, p.logo, p.description]);
      }
    }

    // Insert categories
    if (dbData.categories && dbData.categories.length > 0) {
      console.log(`Seeding ${dbData.categories.length} categories...`);
      for (const c of dbData.categories) {
        await client.query(`
          INSERT INTO categories (id, name, slug)
          VALUES ($1, $2, $3)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug
        `, [toUuid(c.id), c.name, c.slug]);
      }
    }

    // Insert games
    if (dbData.games && dbData.games.length > 0) {
      console.log(`Seeding ${dbData.games.length} games...`);
      for (const g of dbData.games) {
        const publisherId = g.publisher_id && g.publisher_id !== '' ? toUuid(g.publisher_id) : null;
        await client.query(`
          INSERT INTO games (
            id, title, slug, description, cover_image, screenshots, trailer_url,
            type, title_id, languages, required_firmware, release_date, game_size, game_version, publisher_id, likes, created_at, updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET 
            title = EXCLUDED.title, slug = EXCLUDED.slug, description = EXCLUDED.description, cover_image = EXCLUDED.cover_image,
            screenshots = EXCLUDED.screenshots, trailer_url = EXCLUDED.trailer_url, type = EXCLUDED.type, title_id = EXCLUDED.title_id,
            languages = EXCLUDED.languages, required_firmware = EXCLUDED.required_firmware, release_date = EXCLUDED.release_date,
            game_size = EXCLUDED.game_size, game_version = EXCLUDED.game_version, publisher_id = EXCLUDED.publisher_id, likes = EXCLUDED.likes
        `, [
          toUuid(g.id), g.title, g.slug, g.description, g.cover_image, JSON.stringify(g.screenshots), g.trailer_url,
          g.type, g.title_id, g.languages, g.required_firmware, g.release_date, g.game_size, g.game_version,
          publisherId, g.likes, g.created_at, g.updated_at
        ]);
      }
    }

    // Insert game_categories
    if (dbData.game_categories && dbData.game_categories.length > 0) {
      console.log(`Seeding game_categories links...`);
      for (const gc of dbData.game_categories) {
        await client.query(`
          INSERT INTO game_categories (game_id, category_id)
          VALUES ($1, $2)
          ON CONFLICT (game_id, category_id) DO NOTHING
        `, [toUuid(gc.game_id), toUuid(gc.category_id)]);
      }
    }

    // Insert download_links
    if (dbData.download_links && dbData.download_links.length > 0) {
      console.log(`Seeding download links...`);
      for (const dl of dbData.download_links) {
        await client.query(`
          INSERT INTO download_links (id, game_id, version, mirrors, created_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO UPDATE SET version = EXCLUDED.version, mirrors = EXCLUDED.mirrors
        `, [toUuid(dl.id), toUuid(dl.game_id), dl.version, JSON.stringify(dl.mirrors), dl.created_at]);
      }
    }

    // Insert comments
    if (dbData.comments && dbData.comments.length > 0) {
      console.log(`Seeding comments...`);
      for (const c of dbData.comments) {
        await client.query(`
          INSERT INTO comments (id, game_id, username, email, content, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [toUuid(c.id), toUuid(c.game_id), c.username, c.email, c.content, c.created_at]);
      }
    }

    // Insert reports
    if (dbData.reports && dbData.reports.length > 0) {
      console.log(`Seeding reports...`);
      for (const r of dbData.reports) {
        await client.query(`
          INSERT INTO reports (id, game_id, email, reason, resolved, created_at)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING
        `, [toUuid(r.id), toUuid(r.game_id), r.email, r.reason, r.resolved, r.created_at]);
      }
    }

    console.log('Database seeding successfully finished!');
  } catch (error) {
    console.error('Migration failed with error:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

run();
